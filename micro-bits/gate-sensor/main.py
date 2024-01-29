from microbit import *
import radio
import GateSensor

def addGateSensor():
    gateSensor = GateSensor.GateSensor()
    calibrationComplete = False

    while(calibrationComplete == False):
        
        if(button_a.is_pressed()):
            display.show(Image.CONFUSED)
            gateSensor.calibrateSensor()
            calibrationComplete = True

    while (True):
        radio.send(gateSensor.getCurrentGateStatus())

def main():
    radio.on()
    radio.config(channel=11)

    addGateSensor()

main()