from microbit import *
import radio
import environmentSensors as sensors

#TODO:
# - Get receive working

PACKET_ID = 2

thisSensor = sensors.EnvironmentSensor()
brightness = 0
name = ""

noiseThreshold = 15
noiseAndMontionLights = True


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

#detects if there is motion near the sensor
def detectMotion():
    sensorState = 0
    
    reading = pin0.read_digital() #Reads sensor output connected to pin D6
    if (reading == 1):
        if(sensorState == 0): #Checks if sensor state has changed from its previous state
            sensorState = 1                   #preserves current sensor state
    else:
        if (sensorState == 1): #Checks if sensor state has changed from its previous state
            sensorState = 0                    #preserves current sensor state

    return sensorState
        
#not used for 311 yet
def pendForRequests():

    global thisSensor

    while True:
        request = radio.receive()

        #<0, recipient, request type, iteration>
        if request:

            request = request.strip() # Remove leading linebreak
            reqArray = request.split(",")
            message = None

            if (len(reqArray) >= 2): # worth considering

                #if something is addressed to this microbit
                if (reqArray[0] == "0" and reqArray[1] == name):

                    if (reqArray[2] == "1"): # environment
                        message = name + "," + str(reqArray[3]) + "," + str(thisSensor.getTemp()) + "," + str(thisSensor.getAmbientLight()) + "," + str(thisSensor.getNoiseLevel())       
                
                if message is not None: # Replacement for exception handling to stop breaking the loop
                    radio.config(channel=11) #recieveing on
                    radio.send("2," + message)
                    radio.config(channel=13) #sending request to station
            
            sleep(1) # Avoid overloading

def main():

    global name
    global thisSensor

    radio.on()
    radio.config(channel=21)#to send to receiver
    
    #radio.config(channel = 13)#for the recieving of requests
    name = thisSensor.getMicroName()

    while True:
        #send data periodically to the receiver every second
        radio.send(str(PACKET_ID)+","+name+ ","+ str(getAverageTemp()) + "," + str(getAverageLight()) + "," + str(getAverageNoise()))   
        sleep(1)

        if(button_a.is_pressed() and button_b.is_pressed()):
            #scroll name of microbit
            display.scroll(name)

    #pendForRequests()



main()