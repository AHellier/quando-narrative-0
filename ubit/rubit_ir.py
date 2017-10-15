# Remote micro:bit - boot with 'a' button pressed for passive infrared, boot without for face up/down 
import radio, math
from microbit import *

# Common - easier this way due to simple build process
class COMMS: # message, icon/character, json - which is ignored for rubit
    IR = ('I', Image.HEART, '{"ir":true}')
    BUTTON_A = ('a', 'a', '{"button":"a"}')
    BUTTON_B = ('b', 'b', '{"button":"b"}')
    FACE_UP = ('U', '^', '{"orientation":"up"}')
    FACE_DOWN = ('D', 'v', '{"orientation":"down"}')
    LEFT = ('L', '<', '{"orientation":"left"}')
    RIGHT = ('R', '>', '{"orientation":"right"}')
    UP = ('B', 'B', '{"orientation":"backward"}')
    DOWN = ('F', 'F', '{"orientation":"forward"}')
    HEADING = 'H'
    ROLL = 'R'
    arr = [IR, BUTTON_A, BUTTON_B, FACE_UP, FACE_DOWN, LEFT, RIGHT, UP, DOWN]
    @staticmethod
    def send(tuple):
        radio.send(tuple[0])

_channel = 0
CONFIG_FILE = 'config.txt'

# The radio won't work unless it's switched on.
def radio_on():
    print('{"channel":' + str(_channel) + '}')
    radio.config(channel=_channel) # set the channel
    radio.on()

def display_channel():
    if _channel <= 9:
        display.show(str(_channel))
    else:
        display.show(chr(_channel-10+ord('A')))

def check_button(button, add):
  global _channel # this allows us to change the global variable
  if button.is_pressed():
    _channel = _channel + add # which we do here
    if _channel < 0:
      _channel = 15
    elif _channel > 15:
      _channel = 0
    save()
    display_channel()
    sleep(500) # this is 0.5 seconds, or 500 millisecon

def config():
    display_channel()
    while True:
        check_button(button_a, -1)
        check_button(button_b, 1)

def save():
    with open(CONFIG_FILE, 'w') as file:
        file.write(str(_channel))
        
def load():
    global _channel
    try:
        with open(CONFIG_FILE, 'r') as file:
            data = file.read()
            _channel = int(data)
    except:
        print('{"Initialising":true}')
        save()
    display_channel()
    sleep(200)
    
def gesture():
    last_gesture = ""
    ticks = 0
    while True:
        if button_a.was_pressed():
            COMMS.send(COMMS.BUTTON_A)
        if button_b.was_pressed():
            COMMS.send(COMMS.BUTTON_B)

        gest = accelerometer.current_gesture()
        if gest == last_gesture:
            ticks += 1
            if ticks == 50:
                ticks=0
            else:
                sleep(20)
        else:
            last_gesture = gest
            ticks = 0
        if ticks == 0:
            comms = False
            if gest == 'face up':
                comms = COMMS.FACE_UP
            elif gest == 'face down':
                comms = COMMS.FACE_DOWN
            elif gest == 'up':
                comms = COMMS.UP
            elif gest == 'down':
                comms = COMMS.DOWN
            elif gest == 'left':
                comms = COMMS.LEFT
            elif gest == 'right':
                comms = COMMS.RIGHT
            if comms != False:
                display.show(comms[1])
                COMMS.send(comms[0])
    return # never does

#        if (pin0.read_digital() == 1):
#           COMMS.send(COMMS.IR)

def heading():
    while button_a.is_pressed() and button_b.is_pressed():
        display.show('-')
        sleep(500)
        display.show('+')
        sleep(500)
    last_heading = 180
    last_roll = 180
    while True:
        if button_a.is_pressed() and button_b.is_pressed():
            compass.calibrate()
        heading = compass.heading()
        if (heading != last_heading) :
            radio.send(COMMS.HEADING+str(heading))
            last_heading = heading
            needle = ((15 - heading)//30)%12
            display.show(Image.ALL_CLOCKS[needle])
#        x = min(accelerometer.get_x()/1024, 1)
#        roll = int(math.degrees(math.acos(max(x,-1))))
#        if (roll != last_roll) :
#            radio.send(COMMS.ROLL+str(roll))
#            last_roll = roll
        sleep(20)
        display.show(' ')
    return # never does

#Main program
print('{"started":true}')
load()
radio_on()
if button_a.is_pressed() and button_b.is_pressed():
    config()
elif not button_a.is_pressed() and button_b.is_pressed():
    heading()
else:
    gesture()

#elif button_a.is_pressed() and not button_b.is_pressed():
#    visitor_sense()
