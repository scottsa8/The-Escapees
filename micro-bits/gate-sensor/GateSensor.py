from microbit import *
from PiicoDev_VL53L1X import PiicoDev_VL53L1X

class GateSensor:

    def __init__(self):
        
        self.sensitivity = 100
        pass

    def calibrateSensor(self):

        sleep(1000)
        distValues = []
        i=0
        for i in range(100):
            distValues.append(self.getDistance())
            sleep(10)
            i = i + 1

        self.distCaliVal = sum(distValues)/len(distValues)
        display.show(Image.HAPPY)

    #uses the distance sensor
    def getDistance(self):

        distanceSensor = PiicoDev_VL53L1X()

        distance = distanceSensor.read()/10 #in mm

        return distance
    
    def getCurrentGateStatus(self):

        currentDistance = self.getDistance()

        if((currentDistance > (self.distCaliVal + self.sensitivity)) or (currentDistance < (self.distCaliVal - self.sensitivity))):
            status = "Trigger"
        else:
            status = "None"
    
        return status
    

    
    def setSensitivity(self, sensitivity):
        self.sensitivity = sensitivity