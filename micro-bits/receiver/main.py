from microbit import *
import radio

entriesLog = []
count = 0
arrivedTime = 0


TIMEOUT = 2000

#will check for any requests wanting to be sent from the server to other micro:bits
def sendDataFromServer():

    if uart.any():
        data = uart.readline()
        decodedMessage = data.decode('utf-8').strip()
        message = str(decodedMessage)

        radio.config(channel=13)
        radio.send(message)
        radio.config(channel=11)

def findEntries():
    global entriesLog
    global count


    if(entriesLog[0] != entriesLog[1]):
        #someone has entered room side entrieslog[1]
        print("3,"+entriesLog[1])
    
    entriesLog = []
    count = 0


def logEntries(name):
    global count
    global entriesLog

    if (count < 2):
        print(str(entriesLog))
        entriesLog.append(name)
        count = count + 1

        if(count == 2):
            findEntries()
    else:
        print(str(entriesLog))
        findEntries()


def main():

    global count
    global entriesLog
    global arrivedTime

    radio.on()
    radio.config(channel=21, power=7, queue = 10)#to receiver
    print("Starting")
    
    arrivedTime = running_time()

    while True:
        message = radio.receive()
        #sendDataFromServer()
        
        currentTime = running_time()

        timePassed = currentTime - arrivedTime

        if(timePassed > TIMEOUT):
            count = 0
            entriesLog = []

        if message:
            messageArr = message.split(",")
            if(messageArr[0] == "99"):
                logEntries(messageArr[1])
                arrivedTime = running_time()
                
            else:
                print(message)


main()