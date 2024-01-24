### USED FOR BASIC SENSOR INFO ###

from microbit import *
from opt3001 import *
import struct
import machine

class EnvironmentSensor():

    def __init__(self):

        self.__lightSensor = opt3001()#light sensor object

        self.__setMicroName()

    ##tempearature reading
    def getTemp(self):
        tempReading = temperature()
        return tempReading

    ##Ambient light level reading
    def getAmbientLight(self):
        ambientReading = self.__lightSensor.read_lux_float()
        #ambientReading = 100
        return ambientReading

    ##Noise level reading
    def getNoiseLevel(self):
        noiseReading = microphone.sound_level()
        return noiseReading


    #the name of the microbit itself
    def __setMicroName(self):
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

        self.__microName = "".join(name)

    def getMicroName(self):
        return self.__microName
