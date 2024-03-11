from microbit import *
import music
import radio
import struct
import machine

# Threshold for magnetic force
threshold = 200000
track = False

def get_name():
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
    return "".join(name)

def show_magnetic_force():
    force = compass.get_field_strength()
    display.scroll("Force: {}".format(force))

def main():
    global track
    name = get_name()
    radio.config(channel=21)  # Server
    radio.on()
    previous_state = None

    while True:
        if button_a.was_pressed():
            track = not track
            sleep(500)
            if track:
                previous_state = "True"
                display.show(Image.NO)
            else:
                music.play(['C5:1', 'C5:1', 'C5:1'])
                display.clear()

        current_state = "False" if compass.get_field_strength() < threshold else "True"

        if track and current_state != previous_state:
            print("Force: {}, State: {}".format(compass.get_field_strength(), current_state))
            if current_state == "False":
                display.show(Image.YES)  # Open
                music.play(['F#5:6', 'C5:6'])
            else:
                display.show(Image.NO)  # Closed
            radio.send("4," + name + "," + current_state)

        previous_state = current_state
        sleep(100)
main()
