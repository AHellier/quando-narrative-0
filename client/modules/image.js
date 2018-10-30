(() => {
    let quando = this['quando']
    if (!quando) {
        alert('Fatal Error: style.js must be included after quando_browser')
    }
    let self = quando.image = {}

    function _image(style, img) {
        img = '/client/media/' + encodeURI(img)
        quando.image_update_video(img)
        quando.style.set(style, '#quando_image', 'background-image', 'url('+img+')')
    }

    self.set = (img) => {
        _image(quando.style.DISPLAY, img)
    }

    self.setDefault = (img) => {
        _image(quando.style.DEFAULT, img)
    }

    function _rotate(style, axis, val, mid, range, inverted) {
        let rad = quando.convert_angle(val, mid, range, inverted)
        quando.style.set(style, '#quando_image', 'transform', `rotate${axis}(${rad}rad)`);
    }

    self.roll = (val, mid, range, inverted) => {
        _rotate(quando.style.DISPLAY, 'Z', val, mid, range, inverted)
    }

    self.rollDefault = (val, mid, range, inverted) => {
        _rotate(quando.style.DEFAULT, 'Z', val, mid, range, inverted)
    }

    self.pitch = (val, mid, range, inverted) => {
        _rotate(quando.style.DISPLAY, 'X', val, mid, range, inverted)
    }

    self.pitchDefault = (val, mid, range, inverted) => {
        _rotate(quando.style.DEFAULT, 'X', val, mid, range, inverted)
    }

    self.yaw = (val, mid, range, inverted) => {
        _rotate(quando.style.DISPLAY, 'Y', val, mid, range, inverted)
    }

    self.yawDefault = (val, mid, range, inverted) => {
        _rotate(quando.style.DEFAULT, 'Y', val, mid, range, inverted)
    }

    self.in_out = (val, mid, range, inverted) => {
        // let z = quando.convert_linear(val, mid, range, inverted)
        // quando.style.set(style, '#quando_image', 'transform', `rotate${axis}(${rad}rad)`);
        // _rotate(quando.style.DEFAULT, 'Y', val, mid, range, inverted)
    }

    function _convert_percent_linear(val, mid, range, inverted) {
        if (val === false) { val = 0.5 }
        if (inverted) { val = 1 - val }
        let min = (mid - range)
        let max = (mid + range)
        return min + (val * (max-min))
    }

    function _left_right(style, val, mid, range, inverted) {
        let x = _convert_percent_linear(val, mid, range, inverted)
        quando.style.set(style, '#quando_image', 'background-position-x', x + '%');
    }

    self.left_right = (val, mid, range, inverted) => {
        _left_right(quando.style.DISPLAY, val, mid, range, inverted)
    }

    self.left_rightDefault = (val, mid, range, inverted) => {
        _left_right(quando.style.DEFAULT, val, mid, range, inverted)
    }

    self.up_down = (val, mid, range, inverted) => {
        // self.y = _convert_linear(val, mid, range, inverted)
    }

})()