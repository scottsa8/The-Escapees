from microbit import *
import radio

#TODO: 
# - There can be a variable amount of zones
# - There can be a variable amount of people you are tracking
# - They could be in completly different rooms
# - Change the format of the message sent to server

locationData = [["C", -9000], ["P", -9000], ["T", -9000]]#add to array#[[C, strength], [P, strength], [T, strength]]], [labUser2]]

lastLocation = "DummyValue"# a value that will be changed when the first value comes in
lastTriggeredGate = "DummyValue"

numberOfUsers = 0
locationChange = False

cWeight = 50
pWeight = 50
tWeight = 50

def locateUser(messageArray):
    # 99, position, username, signal strength
    global lastLocation
    global locationChange
    global locationData

    global cWeight
    global pWeight
    global tWeight

    #use weightings to get rid of potential signal errors
    maxWeight = 100# for the latest sensor
    minWeight = 1 # for least recent sensor
    weightRate = 1

    locationPoint = messageArray[1]
    #labUser = messageArray[2]
    try:
        strength = int(messageArray[3])
    except:
        strength = -10000

    for i in range(len(locationData)):
        
        if(locationData[i][0] == locationPoint):
            locationData[i][1] = strength #update with the new strength values

    #Which point is the user closer to?
    c = locationData[0][1]
    p = locationData[1][1]
    t = locationData[2][1]

    location = "ERR"

    locationChange = False

    #look for highest value
    if((c > p) and (c > t)):

        #don't go above min and max weightings
        if(cWeight < maxWeight):#maxWeight is a fraction
            cWeight = cWeight + weightRate

            if(pWeight > minWeight):
                pWeight = pWeight - weightRate

            if(tWeight > minWeight):
                tWeight = tWeight - weightRate

    elif((p > c) and (p > t)):

        if(pWeight < maxWeight):#maxWeight is a fraction
            pWeight = pWeight + weightRate

            if(cWeight > minWeight):
                cWeight = cWeight - weightRate

            if(tWeight > minWeight):
                tWeight = tWeight - weightRate

    elif((t > c) and (t > p)):

        if(tWeight < maxWeight):#maxWeight is a fraction
            tWeight = tWeight + weightRate

            if(pWeight > minWeight):
                pWeight = pWeight - weightRate

            if(cWeight < minWeight):
                cWeight = cWeight - weightRate

    else: #if the user has the same strength between p and the other sensors

        if(pWeight < maxWeight):#maxWeight is a fraction
            pWeight = pWeight + weightRate

            if(cWeight > minWeight):
                cWeight = cWeight - weightRate

            if(tWeight > minWeight):
                tWeight = tWeight - weightRate


    if((cWeight > pWeight) and (cWeight > tWeight)):
        location = "C"

        if(lastLocation != "C"):
            locationChange = True

    elif((pWeight > cWeight) and (pWeight > tWeight)):
        location = "P"

        if(lastLocation != "P"):
            locationChange = True

    elif((tWeight > cWeight) and (tWeight > pWeight)):
        location = "T"

        if(lastLocation != "T"):
            locationChange = True

    else: #if the user has the same strength between p and the other sensors
        location = "P"

        if(lastLocation != "P"):
            locationChange = True

    #location = (location + ", C "+str(cWeight)+", P "+str(pWeight)+", T "+str(tWeight))
    lastLocation = location

    return location

def main():
    radio.on()
    radio.config(channel=11, power=7, queue = 10)
    print("Starting")
    
    while True:
        message = radio.receive()
        
        if message:
            try:
                mssgArr = message.split(",")

                #if it is a movement data packet coming in
                if((mssgArr[0] == "99") and (mssgArr[1])):
                    location = locateUser(mssgArr)
                    #only sends a message if the user has moved
                    if(locationChange == True):
                        #print(user + " moved to " + location)
                        print("3,1,"+location)

                else:
                    print(message)
            except:
                print(message)

main()