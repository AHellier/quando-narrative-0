(function () {
  var quando = this['quando']
  if (!quando) {
    alert('Fatal Error: Leap Motion must be included after quando_browser')
  }
  var self = quando.leap = {}
  self.controller = new Leap.Controller()
  self.controller.on('connect', function () {
    self.controller.on('frame', self.handler)
  })

  self.handOpen = function (callback) {
    quando.add_handler('leapHandOpen', callback)
  }

  self.handClosed = function (callback) {
    quando.add_handler('leapHandClosed', callback)
  }

  function _handleXYZ (event, callback, extras) {
    var scale = quando.new_scaler(extras.min, extras.max, extras.inverted)
    quando.add_scaled_handler(event, callback, scale)
  }

  function _handleAngle (event, callback, extras) {
    var scale = quando.new_angle_scaler(extras.mid_angle, extras.plus_minus, extras.inverted)
    quando.add_scaled_handler(event, callback, scale)
  }

  self.handleX = function (callback, extras) {
    _handleXYZ('leapX', callback, extras)
  }

  self.handleY = function (callback, extras) {
    _handleXYZ('leapY', callback, extras)
  }

  self.handleZ = function (callback, extras) {
    _handleXYZ('leapZ', callback, extras)
  }

  self.handleRoll = function (callback, extras) {
    _handleAngle('leapRoll', callback, extras)
  }

  self.handlePitch = function (callback, extras) {
    _handleAngle('leapPitch', callback, extras)
  }

  self.handleYaw = function (callback, extras) {
    _handleAngle('leapYaw', callback, extras)
  }

  function _radians_to_degrees (radians) {
    var degrees = 180 * radians / Math.PI
    return (degrees + 360) % 360 // avoid negative remainder - % is not mod...
  }

  self.last_x = false
  self.last_y = false
  self.last_z = false
  self.last_roll = false
  self.last_pitch = false
  self.last_yaw = false
  self.last_flat = false
  self.handler = function (frame) {
    if (frame.hands) {
      if (frame.hands.length >= 1) {
        var hand = frame.hands[0]
        quando.idle_reset()
        var [x, y, z] = hand.palmPosition
        z = -z // make z increase as the hand moves away from the visitor
        if (x != self.last_x) {
          quando.dispatch_event('leapX', {'detail': x})
          self.last_x = x
        }
        if (y != self.last_y) {
          quando.dispatch_event('leapY', {'detail': y})
          self.last_y = y
        }
        if (z != self.last_z) {
          quando.dispatch_event('leapZ', {'detail': z})
          self.last_z = z
        }
        var roll = _radians_to_degrees(-hand.roll())
        if (roll != self.last_roll) {
          quando.dispatch_event('leapRoll', {'detail': roll})
          self.last_roll = roll
        }
        var pitch = _radians_to_degrees(hand.pitch())
        if (pitch != self.last_pitch) {
          quando.dispatch_event('leapPitch', {'detail': pitch})
          self.last_pitch = pitch
        }
        var yaw = _radians_to_degrees(hand.yaw())
        if (yaw != self.last_yaw) {
          quando.dispatch_event('leapYaw', {'detail': yaw})
          self.last_yaw = yaw
        }
        var strength = hand.grabStrength
        if (strength == 1 && self.last_flat) {
          quando.dispatch_event('leapHandClosed')
          self.last_flat = false
        }
        if (strength <= 0.9 && !self.last_flat) {
          quando.dispatch_event('leapHandOpen')
          self.last_flat = true
        }
      }
    }
  }

  self.controller.connect()
})()
