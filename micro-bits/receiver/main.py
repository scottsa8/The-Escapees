from microbit import *
import radio

entriesLog = []
count = 0
arrivedTime = 0

TIMEOUT = 2000
PACKET_SIZE = 16
uart_buffer = bytearray()

def sendDataFromServer():
    global uart_buffer  # Define a global buffer to store incomplete data
    if uart.any():
        radio.config(channel=22)
        uart_data = uart.read()
        uart_buffer.extend(uart_data)

        while b'\n' in uart_buffer:  # Process complete lines
            line, uart_buffer = uart_buffer.split(b'\n', 1)
            decodedMessage = line.decode('utf-8').strip()
            print(decodedMessage)  # Print raw data for debugging
            radio.send(decodedMessage)
        
        radio.config(channel=21)


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
        #print(str(entriesLog))
        entriesLog.append(name)
        count = count + 1

        if(count == 2):
            findEntries()
    else:
       # print(str(entriesLog))
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
        sendDataFromServer()
        
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
