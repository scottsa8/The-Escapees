import struct
from microbit import *
import radio
import GateSensor
import machine

#the name of the microbit itself
def setMicroName():
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

def addGateSensor():
    name = setMicroName()
    gateSensor = GateSensor.GateSensor()
    calibrationComplete = False

    while(calibrationComplete == False):
        
        if(button_a.is_pressed()):
            display.show(Image.CONFUSED)
            gateSensor.calibrateSensor()
            calibrationComplete = True

    while (True):

        if(gateSensor.getCurrentGateStatus() == "Trigger"):
            #send radio to other gate
            radio.config(channel=24, queue=1) 
            radio.send(name)
            

        radio.config(channel=24, queue=1)
        message = radio.receive()

        if message and message != name:

            while True:
                if(gateSensor.getCurrentGateStatus() == "Trigger"):
                    radio.config(channel=21)
                    radio.send(name)
                    radio.config(channel=24, queue=1)
                    break

            

        #radio.send(gateSensor.getCurrentGateStatus())

def main():
    radio.on()
    radio.config(channel=24)

    addGateSensor()

main()