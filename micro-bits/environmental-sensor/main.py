from microbit import *
import radio
import environmentSensors as sensors

#TODO:
# - Change radio channels
# - The way the microbit is addressed should be extensible (when sending requests)
# - The format of the packets


thisSensor = sensors.EnvironmentSensor()
brightness = 0
location = "placeholder"

noiseThreshold = 15
noiseAndMontionLights = True

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
        

def pendForRequests():

    global thisSensor
    global location

    while True:
        request = radio.receive()

        #<0, recipient, request type, iteration>
        if request:

            request = request.strip() # Remove leading linebreak
            reqArray = request.split(",")
            message = None

            if (len(reqArray) >= 2): # worth considering

                #if something is addressed to this microbit
                if (reqArray[0] == "0" and reqArray[1] == location):

                    if (reqArray[2] == "1"): # environment
                        message = location + "," + str(reqArray[3]) + "," + str(thisSensor.getTemp()) + "," + str(thisSensor.getAmbientLight()) + "," + str(thisSensor.getNoiseLevel())       
                
                if message is not None: # Replacement for exception handling to stop breaking the loop
                    radio.config(channel=11) #recieveing on
                    radio.send("1,"+message)
                    radio.config(channel=13) #sending request to station
            
            sleep(1) # Avoid overloading

def main():

    global location
    global thisSensor

    radio.on()
    
    radio.config(channel = 13)#for the recieving of requests
    microName = thisSensor.getMicroName()

    #get the location of the microbit
    if(microName == "popev"):
        location = "c"
    elif(microName == "toget"):
        location = "t"
    elif(microName == "zegop"):
        location = "p"
    else:
        location = "h"#for testing

    print(location)
    pendForRequests()



main()