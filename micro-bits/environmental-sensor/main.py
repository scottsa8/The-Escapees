from microbit import *
import radio
import environmentSensors as sensors

PACKET_ID = 2
thisSensor = sensors.EnvironmentSensor()
name = ""

def getAverageTemp():
    temps = []

    for i in range(0,333):
        temps.append(thisSensor.getTemp())
        sleep(1)
    
    avg = sum(temps)/len(temps)
    return avg

def getAverageNoise():
    noise = []

    for i in range(0,333):
        noise.append(thisSensor.getNoiseLevel())
        sleep(1)
    
    avg = sum(noise)/len(noise)
    return avg

def getAverageLight():
    noise = []

    for i in range(0,333):
        noise.append(thisSensor.getAmbientLight())
        sleep(1)
    
    avg = sum(noise)/len(noise)
    return avg

def main():
    global name
    global thisSensor

    radio.on()
    name = thisSensor.getMicroName()

    while True:
        # Send data to the receiver every second
        radio.config(channel=21)# Send to receiver
        radio.send(str(PACKET_ID)+","+name+ ","+ str(getAverageTemp()) + "," + str(getAverageLight()) + "," + str(getAverageNoise()))   
        radio.config(channel=22) # Send to location-ping microbits
        radio.send(name)
        sleep(1)

        # Print name when button combo pressed
        if(button_a.is_pressed() and button_b.is_pressed()):
            display.scroll(name)
main()