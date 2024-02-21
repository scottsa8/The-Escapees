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
                display.scroll(message_str)
                panic()
            message_data = message_str.split(',')

            # if message_data[0].strip().isdigit() and message_data[1] == name:
            #     # New message
            #     display.scroll("x")
            #     full_message = message_data[2]
            # # elif name in message_str:
            # #     #update the list for the user's location
            # #     display.scroll("y")
            # #     updateCounts()
            # #     locationNodeName = findLocation()
            # #     #send the user's name and location to the receiver
            # #     radio.config(channel=21)#send message to server
            # #     radio.send(str(MESSAGE_ID)+","+name+","+locationNodeName)
            # #     radio.config(channel=22)#receive from node
            # else:
            #     # Append the received part to the existing message
            #     display.scroll("z")
            #     full_message += message_data[0]
            #     display.scroll(message_data[0])

            #     # Check if the message contains the terminator "/eom/"
            #     if "/EOM/" in full_message:
            #         display.scroll("2")
            #         # Remove the terminator and display the message
            #         full_message = full_message.replace("/EOM/", "")
            #         display.scroll(full_message)
            #         full_message = ""  # Reset the message buffer after displaying  
            # hasLocation = False
        sleep(100) 
main()
