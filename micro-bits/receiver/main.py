from microbit import *
import radio


#will check for any requests wanting to be sent from the server to other micro:bits
def sendDataFromServer():

    if uart.any():
        data = uart.readline()
        decodedMessage = data.decode('utf-8').strip()
        message = str(decodedMessage)

        radio.config(channel=13)
        radio.send(message)
        radio.config(channel=11)

def main():
    radio.on()
    radio.config(channel=21, power=7, queue = 10)
    print("Starting")
    
    while True:
        message = radio.receive()
        sendDataFromServer()
        
        if message:
            print(message)


main()