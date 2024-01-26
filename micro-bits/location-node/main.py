from microbit import *
import radio
import struct
import machine


#TODO:
# - Change radio channel
# - Change the packet look
# - Format for multiple users?

def getName():
    
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


#Set up around the room to track user
def main():
    radio.on()
    radio.config(channel=22)#send to location-ping microbits

    name = getName()

    while True:

        radio.send(name)
        sleep(1000)
     

main()