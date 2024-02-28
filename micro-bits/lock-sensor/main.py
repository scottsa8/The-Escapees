from microbit import *
import music

# Threshold for magnetic force
threshold = 100000

def show_magnetic_force():
    force = compass.get_field_strength()
    display.scroll("Force: {}".format(force))
    
def main():
    while True:
        print("Force: {}".format(compass.get_field_strength()))
        if compass.get_field_strength() < threshold:
            display.show(Image.YES) # Open
            music.play(['F#5:6', 'C5:6'])
        else:
            display.show(Image.NO) # Closed
        sleep(100)
main()
