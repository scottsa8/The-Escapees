from microbit import *
import music
import radio
import struct
import machine

MESSAGE_ID = 1
name = ""
#for keeping track of users location

nodeList = [] #Node name, Signal Strength, count
lastLocation = ""

STARTING_COUNT = 0
COUNT_WEIGHT = 10
MAX_COUNT = 100
MIN_COUNT = 0

A_PRESS_THRESHOLD = 1000
B_PRESS_THRESHOLD = 1000 
DOUBLE_PRESS_DELAY = 500

def getName():
    
    length = 5
    letters = 5
    codebook = [
        ['z', 'v', 'g', 'p', 't'],
        ['u', 'o', 'i', 'e', 'a'],
        ['z', 'v', 'g', 'p', 't'],
        ['u', 'o', 'i', 'e', 'a'],
        ['z', 'v', 'g', 'p', 't']
    ]
    name = []

    # Derive our name from the nrf51822's unique ID
    _, n = struct.unpack("II", machine.unique_id())
    ld = 1
    d = letters

    for i in range(0, length):
        h = (n % d) // ld
        n -= h
        d *= letters
        ld *= letters
        name.insert(0, codebook[i][h])

    return ("".join(name))

def updateCounts():
    # Node list = [[Name, signalStrength, count], [], [], ...]
    global nodeList

    #create a strength list so you can compare strength values
    strengthList = []

    for i in range(len(nodeList)):
        strengthList.append(nodeList[i][1])
    strongestSignal = min(strengthList)

    #find what node the strongest signal is from
    closestNodePointer = None
    for i in range(len(strengthList)):
        if(strengthList[i] == strongestSignal):
            closestNodePointer = i
            break

    #update the counts for each node
    for i in range(len(nodeList)):
        if (i == closestNodePointer):
            if(nodeList[i][2] < MAX_COUNT):
                nodeList[i][2] = nodeList[i][2] + COUNT_WEIGHT
        else:
            if(nodeList[i][2] > MIN_COUNT):
                nodeList[i][2] = nodeList[i][2] - COUNT_WEIGHT

def findLocation():
    #find which node has the highest count
    closestNodeName = ""

    countList = []
    for i in range(len(nodeList)):
        countList.append(nodeList[i][2])
    maxCount = max(countList)

    for i in range(len(nodeList)):
        if(nodeList[i][2] == maxCount):
            closestNodeName = nodeList[i][0]
            break
    return closestNodeName


def decodeMessage(message):
    # display.scroll(message)
    global nodeList
    hasLocation = False

    if message:
        currentNodeName = message[0][3:].decode()
        print("node name: "+currentNodeName)
        signalStrength = str(message[1])
        print("signal: "+signalStrength)
        nodeRegisterd = False

        print("node list: "+str(nodeList))
        #search through list of connected nodes
        for i in range(len(nodeList)):
            try:
                if (nodeList[i][0] == currentNodeName):
                    print("found node")
                    # update previous entry to array
                    nodeList[i][1] = signalStrength
                    nodeRegisterd = True
                    break
            except:
                nodeRegisterd = False  
        #if node isn't there, add its nam
        if (nodeRegisterd == False):
            print("Didn't find node")
            nodeList.append([currentNodeName, signalStrength, STARTING_COUNT])  
            print("new node list: "+str(nodeList)) 
        
        hasLocation = True
    return hasLocation

def check_double_press(button_pin):
    first_press = button_pin.is_pressed()
    sleep(DOUBLE_PRESS_DELAY)
    second_press = button_pin.is_pressed()
    return first_press and second_press

def panic():
    music.play(['F#5:6', 'C5:6', 'F#5:6', 'C5:6', 'F#5:6', 'C5:6', 'F#5:6', 'C5:6'])
    display.scroll("PANIC")

def main():
    global name
    radio.on()
    name = getName()

    while(True):
        # receive message from nodes
        radio.config(channel=22)
        message = radio.receive_full()

        if(button_a.is_pressed() and button_b.is_pressed()):
            #scroll name of microbit
            display.scroll(name)

        if(button_b.is_pressed()):
            panic()
            radio.config(channel=21)
            radio.send("PANIC")

        if message:
            message_str = message[0][3:].decode('utf-8')
            if "PANIC" in message_str and name in message_str:
                panic()

            # Split the message into components
            components = message_str.split(',')
            # display.scroll(message_str)

            # #update the list for the user's location
            hasLocation = decodeMessage(message)

            # Ensure that there are enough components
            if(components[0] == "Recv"):
                print("")
            elif len(components) >= 3:
                try:
                    # Extract microbit name, packet number, and packet data
                    microbit_name = components[0][1:]
                    packet_number = int(components[1])
                    packet_data = components[2]

                    # Check if the microbit name matches the packet microbit name
                    if microbit_name == name:
                        # Read the message part and construct acknowledgment
                        display.scroll(packet_data)
                        acknowledgment = "5,{},{}".format(microbit_name, packet_number)
                        # display.scroll(acknowledgment)  # Display acknowledgment (for testing)

                        # Send acknowledgment back to the server
                        radio.config(channel=21)  # Change to the appropriate channel
                        radio.send(acknowledgment)
                        radio.config(channel=22)  # Change back to the original channel
                except:
                    continue
            elif hasLocation:
                updateCounts()
                locationNodeName = findLocation()

                #send the user's name and location to the receiver
                radio.config(channel=21)#send message to server
                radio.send(str(MESSAGE_ID)+","+name+","+locationNodeName)
                radio.config(channel=22)#receive from node
                hasLocation = False
        sleep(150) 
main()
