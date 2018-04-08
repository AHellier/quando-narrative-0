(function () {
  let self = this['quando_blocks'] = {}
  let PREFIX = 'quando_' // TODO share with quando_editor
  self.CONFIG = {
    ADVANCED_COLOUR: '#ff8888',
    DISPLAY_COLOUR: '#ffcc88',
    MEDIA_COLOUR: '#b3ffb3',
    STYLE_COLOUR: '#ffccff',
    CLIENT_COLOUR: '#9cc9c9',
    TIME_COLOUR: '#ffb3b3',
    LEAP_MOTION_COLOUR: '#aaaaaa',
    DEVICE_COLOUR: '#e6ccff',
    EXPERIMENT_COLOUR: '#bbbbbb',
    VISITOR_COLOUR: '#FFE000',
    USER_COLOUR: '#70B5FF',
    BLOCKLY_SATURATION: 1, // default for hue only colour - probably not used anymore - see http://colorizer.org/
    BLOCKLY_VALUE: 1, // ditto
  }
  const ICON_PRODUCE_VALUE = '\u26A1' // \uD83D\uDD33'
  const ICON_CONSUME_VALUE = '\u26A1' // \uD83D\uDD32'
  var exhibitsList = []

  let ajax_get = (url, callback) => {
    let xhr = new XMLHttpRequest()
    xhr.onload = () => {
      callback(xhr.responseText)
    }
    xhr.open('GET', url, true)
    xhr.send(null)
  }

  var getJSON = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
  };

  function _defineBlock(json, category, colour) {
    json.category = category
    if (!quando_editor.exists(json.colour)) {
      json.colour = colour
    }
    return quando_editor.defineBlock(json)
  }

  self.defineAdvanced = (json) => {
    return _defineBlock(json, 'quando_advanced', self.CONFIG.ADVANCED_COLOUR)
  }
  self.defineDisplay = (json) => {
    return _defineBlock(json, 'quando_display', self.CONFIG.DISPLAY_COLOUR)
  }
  self.defineMedia = (json) => {
    return _defineBlock(json, 'quando_media', self.CONFIG.MEDIA_COLOUR)
  }
  self.defineStyle = (json) => {
    return _defineBlock(json, 'quando_style', self.CONFIG.STYLE_COLOUR)
  }
  self.defineClient = (json) => {
    return _defineBlock(json, 'quando_client', self.CONFIG.CLIENT_COLOUR)
  }
  self.defineTime = (json) => {
    return _defineBlock(json, 'quando_time', self.CONFIG.TIME_COLOUR)
  }
  self.defineLeap = (json) => {
    return _defineBlock(json, 'quando_leap', self.CONFIG.DEVICE_COLOUR)
  }
  self.defineMicrobit = (json) => {
    return _defineBlock(json, 'quando_microbit', self.CONFIG.DEVICE_COLOUR)
  }
  self.defineCursor = (json) => {
    return _defineBlock(json, 'quando_cursor', self.CONFIG.DEVICE_COLOUR)
  }
  self.defineRobot = (json) => {
    return _defineBlock(json, 'quando_robot', self.CONFIG.DEVICE_COLOUR)
  }
  self.defineDevice = (json) => {
    return _defineBlock(json, 'quando_device', self.CONFIG.DEVICE_COLOUR)
  }
  self.defineExperiment = (json) => {
    return _defineBlock(json, 'quando_experiment', self.CONFIG.EXPERIMENT_COLOUR)
  }

  self.defineVisitor = (json) => {
    return _defineBlock(json, 'quando_visitor', self.CONFIG.VISITOR_COLOUR)
  }

  /*self.defineUser = (json) => {
    return _defineBlock(json, 'quando_user', self.CONFIG.USER_COLOUR)
  } */

  self.addBlocks = (quando_editor) => {
    let STATEMENT = 'STATEMENT'
    let DURATION = 'DURATION'
    let MENU_UNITS_MINS = { name: 'Units_mins', title: '', menu: ['Seconds', 'Minutes'] }
    let MENU_UNITS_HOURS = { name: 'Units_hours', title: '', menu: ['Seconds', 'Minutes', 'Hours'] }
    let FREQUENCY = 'FREQUENCY'
    let UNITS_MENU = 'UNITS_MENU'

    let EVERY_BLOCK = 'Every'
    self.defineTime({
      name: EVERY_BLOCK,
      interface: [
        { name: DURATION, title: '', number: '1' }, MENU_UNITS_HOURS,
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let seconds = quando_editor.getNumber(block, DURATION)
        if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Minutes') {
          seconds *= 60
        }
        if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Hours') {
          seconds *= 60 * 60
        }
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.every(' +
          seconds +
          ', function() {\n' + statement + '}' +
          _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
          ');\n'
        return result
      }
    })

    self.defineTime({
      name: 'After',
      interface: [
        { name: DURATION, title: '', number: '1' }, MENU_UNITS_HOURS,
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let seconds = quando_editor.getNumber(block, DURATION)
        if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Minutes') {
          seconds *= 60
        }
        if (quando_editor.getMenu(block, MENU_UNITS_HOURS.name) === 'Hours') {
          seconds *= 60 * 60
        }
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.after(' +
          seconds +
          ', function() {\n' +
          statement +
          '}' +
          _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
          ');\n'
        return result
      }
    })

    let ID_GREETING = 'Greeting'
    self.defineMedia({
      name: 'Show "',
      title: 'Show Text',
      interface: [{ name: ID_GREETING, title: '"', text: '.type your text here..' }, { title: '"' }],
      javascript: (block) => {
        return 'quando.text("' + quando_editor.getText(block, ID_GREETING) + '");\n'
      }
    })

    let SHOW_TITLE = 'Show Title'
    self.defineMedia({
      name: 'Show Title "',
      interface: [{ name: SHOW_TITLE, title: '', text: '.type your title here..' }, { title: '"' }],
      javascript: (block) => {
        return 'quando.title("' + quando_editor.getText(block, SHOW_TITLE) + '");\n'
      }
    })

    let _getOnContained = (block, container, contained, otherwise) => {
      let result = otherwise
      if (quando_editor.getParent(block, container)) {
        result = contained
      }
      return result
    }
    let _getStyleOnContained = (block, container) => {
      return 'set' + _getOnContained(block, container, 'Display', 'Default') + 'Style'
    }

    let COLOUR = 'colour'
    self.defineStyle({
      name: 'Background',
      title: 'Background Display Colour',
      interface: [
        { name: COLOUR, title: '', colour: '#ff0000' }
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let colour = quando_editor.getColour(block, COLOUR)
        return `quando.${method}('#quando_image', 'background-color', '${colour}');\n`
      }
    })

    let IMAGE = 'Images'
    let FILE_IMAGE = { name: IMAGE, title: '', file: 'images' }
    self.defineMedia({
      name: 'Display',
      title: '\uD83D\uDCF7 Show Image',
      interface: [FILE_IMAGE],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let image = quando_editor.getFile(block, IMAGE)
        return `quando.image_update_video("/client/media/${image}");\n` +
          `quando.${method}('#quando_image', 'background-image', 'url("/client/media/${image}")');\n`
      }
    })

    let VIDEO = 'Video'
    let MEDIA_LOOP_MENU = 'MEDIA_LOOP_MENU'
    let CHECK_STOP_WITH_DISPLAY = '   With display'
    let FILE_VIDEO = { name: VIDEO, title: '', file: 'video' }
    self.defineMedia({
      name: 'Show Video',
      title: '\uD83D\uDCFA Play',
      interface: [
        { name: MEDIA_LOOP_MENU, title: '', menu: ['Once', 'Forever'] },
        { title: 'Video' },
        FILE_VIDEO],
      // extras: [
      //     {title: CHECK_STOP_WITH_DISPLAY, check:true},
      // ],
      javascript: (block) => {
        let video_url = quando_editor.getFile(block, VIDEO)
        let loop = (quando_editor.getMenu(block, MEDIA_LOOP_MENU) == 'Forever')
        let result = "quando.video('/client/media/" + video_url + "'" + ', ' + loop + ');\n'
        return result
      }
    })
    let AUDIO = 'Audio'
    let FILE_AUDIO = { name: AUDIO, title: '', file: 'audio' }
    self.defineMedia({
      name: 'Play',
      title: '\uD83D\uDD0A Play',
      interface: [
        { name: MEDIA_LOOP_MENU, title: '', menu: ['Once', 'Forever'] },
        { title: 'Audio' },
        FILE_AUDIO],
      // extras: [
      //     {title: CHECK_STOP_WITH_DISPLAY, check:true  },
      // ],
      javascript: (block) => {
        let _url = quando_editor.getFile(block, AUDIO)
        let loop = (quando_editor.getMenu(block, MEDIA_LOOP_MENU) == 'Forever')
        let result = "quando.audio('/client/media/" + _url + "'" + ', ' + loop + ');\n'
        return result
      }
    })
    let CHECK_TEXT = ' Text'
    let CHECK_TITLE = ' Title'
    let CHECK_IMAGE = ' Image'
    let CHECK_VIDEO = ' Video'
    let CHECK_AUDIO = ' Audio'
    let CLEAR = 'Clear'
    self.defineMedia({
      name: CLEAR,
      interface: [
        { name: CHECK_TEXT, check: false },
        { name: CHECK_TITLE, check: false },
        { name: CHECK_IMAGE, check: false },
        { name: CHECK_VIDEO, check: false },
        { name: CHECK_AUDIO, check: false }
      ],
      javascript: (block) => {
        result = ''
        if (quando_editor.getCheck(block, CHECK_TEXT)) {
          result += 'quando.text();\n'
        }
        if (quando_editor.getCheck(block, CHECK_TITLE)) {
          result += 'quando.title();\n'
        }
        if (quando_editor.getCheck(block, CHECK_IMAGE)) {
          result += `quando.setDisplayStyle('#quando_image', 'background-image', 'url("/client/transparent.png")');\n`
        }
        if (quando_editor.getCheck(block, CHECK_VIDEO)) {
          result += 'quando.clear_video();\n'
        }
        if (quando_editor.getCheck(block, CHECK_AUDIO)) {
          result += 'quando.clear_audio();\n'
        }
        return result
      }
    })

    let DIG_COLOUR = 0
    let WHEN_VITRINE_BLOCK = 'When Display Case'
    let WHEN_VITRINE_TEXT = 'title'
    self.defineDisplay({
      name: WHEN_VITRINE_BLOCK,
      title: 'When Display',
      next: false,
      previous: false,
      interface: [{
        name: WHEN_VITRINE_TEXT, title: '', text: 'Title and label'
      },
      { statement: STATEMENT }
      ],
      javascript: (block) => {
        let title = quando_editor.getText(block, WHEN_VITRINE_TEXT)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = `quando.vitrine("${block.id}", function() {\n` +
          `quando.title("${title}");\n` +
          `${statement}});\n`
        return result
      }
    })

    function _update_menus(ev, block_id, text = false) {
      let topBlocks = Blockly.mainWorkspace.getAllBlocks()
      let matchBlock = [PREFIX + LABEL_TO_BLOCK, PREFIX + SHOW_DISPLAY]
      for (let checkblock of topBlocks) {
        if (matchBlock.includes(checkblock.type)) {
          let menuid = quando_editor.getMenu(checkblock, LABEL_TO_MENU)
          if (menuid == block_id) {
            if (text) {
              quando_editor.setMenuText(checkblock, LABEL_TO_MENU, text)
            } else {
              quando_editor.resetMenu(checkblock, LABEL_TO_MENU)
            }
          }
        }
      }
    }

    Blockly.mainWorkspace.addChangeListener((ev) => {
      let workspace = Blockly.Workspace.getById(ev.workspaceId)
      let block = workspace.getBlockById(ev.blockId)
      if (ev.type == Blockly.Events.CHANGE) {
        if (block.type == PREFIX + WHEN_VITRINE_BLOCK) {
          _update_menus(ev, block.id, ev.newValue)
        }
        quando_editor.updateExtras(block) // Any Extras menu will be updated
      } else if (ev.type == Blockly.Events.CREATE) {
        if (block.type == PREFIX + WHEN_VITRINE_BLOCK) {
          _update_menus(ev, block.id, quando_editor.getText(block, WHEN_VITRINE_TEXT))
        }
        quando_editor.updateExtras(block, true) // Any Extras menu will be updated, including children
      } else if (ev.type == Blockly.Events.DELETE) {
        _update_menus(ev, ev.ids[0])
      }
    })

    // Build the drop down list of Vitrines
    let _label_menu = () => {
      let topBlocks = Blockly.mainWorkspace.getAllBlocks()
      let choices = [['-----', 0]]
      for (let block of topBlocks) {
        if (block.type == PREFIX + WHEN_VITRINE_BLOCK) {
          let text = quando_editor.getText(block, 'title')
          choices.push([text, block.id])
        }
      }
      return choices
    }
    let LABEL_TO_MENU = 'to'
    let _label_javascript = (block) => {
      let menuid = quando_editor.getMenu(block, LABEL_TO_MENU)
      // find when block on id, then get it's title
      let whenblock = Blockly.mainWorkspace.getBlockById(menuid)
      let title = quando_editor.getText(whenblock, WHEN_VITRINE_TEXT)
      let result = `quando.addLabel("${menuid}", "${title}");\n`
      return result
    }
    let LABEL_TO_BLOCK = 'Label to'
    let LABEL_TEXT = 'text'
    self.defineDisplay({
      // TODO must be in a vitrine...?
      name: LABEL_TO_BLOCK,
      title: 'Label',
      interface: [
        {
          name: LABEL_TO_MENU,
          menu: _label_menu
        }
      ],
      javascript: _label_javascript
    })

    let SHOW_DISPLAY = 'Show Display'
    let SHOW_DISPLAY_MENU = 'show display menu'
    self.defineDisplay({
      name: SHOW_DISPLAY,
      interface: [{
        name: LABEL_TO_MENU,
        title: '',
        menu: _label_menu
      }],
      javascript: (block) => {
        let menuid = quando_editor.getMenu(block, LABEL_TO_MENU)
        // find when block on id, then get it's title
        let whenblock = Blockly.mainWorkspace.getBlockById(menuid)
        let result = `quando.showVitrine("${menuid}");\n`
        return result
      }
    })

    let WHEN_LABEL_BLOCK = 'When Label'
    let WHEN_LABEL_TEXT = 'When label text'
    self.defineDisplay({
      name: WHEN_LABEL_BLOCK,
      interface: [
        { name: WHEN_LABEL_TEXT, title: '', text: '**Put label text here**' },
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let text = quando_editor.getText(block, WHEN_LABEL_TEXT)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = `quando.addLabelStatement("${text}", function() {\n${statement}});\n`
        return result
      }
    })

    let STYLE_BLOCK = 'Style'
    let STYLE_MENU = 'style'
    let DIV_MENU = 'div'
    self.defineStyle({
      name: STYLE_BLOCK,
      title: '',
      interface: [
        {
          menu: [['Title', '#quando_title'], ['Text', '#quando_text'], ['Labels', '.quando_label']],
          name: DIV_MENU, title: ''
        },
        {
          menu: ['Font Colour', 'Background Colour'],
          name: STYLE_MENU,
          title: ''
        },
        { name: COLOUR, title: '', colour: '#ff0000' }
      ],
      javascript: (block) => {
        let result = ''
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let div = quando_editor.getMenu(block, DIV_MENU)
        let style = quando_editor.getMenu(block, STYLE_MENU)
        let value = quando_editor.getColour(block, COLOUR)
        if (style == 'Font Colour') {
          style = 'color'
        } else {
          style = 'background-color ' // not actually javascript?!
          // so backgroundColor won't work - has to be CSS interpreted...'
          let bigint = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value)
          let r = parseInt(bigint[1], 16)
          let g = parseInt(bigint[2], 16)
          let b = parseInt(bigint[3], 16)
          value = `rgba(${r}, ${g}, ${b}, 0.6)`
          if (div == '.quando_label') { // Need to put in the transition opacity - I think this is working now
            result += `quando.${method}('${div}.focus', '${style}', 'rgba(${r}, ${g}, ${b}, 1)');\n`
          }
        }
        result += `quando.${method}('${div}', '${style}', '${value}');\n`
        return result
      }
    })

    let FONT_SIZE_BLOCK = 'Font Size'
    let FONT_SIZE = 'font size'
    self.defineStyle({
      name: FONT_SIZE_BLOCK,
      interface: [
        {
          menu: [['Title', '#quando_title'], ['Text', '#quando_text'], ['Labels', '.quando_label']],
          name: DIV_MENU, title: ''
        },
        { name: FONT_SIZE, title: '', number: 100 }, { title: '+ characters across screen' }
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let div = quando_editor.getMenu(block, DIV_MENU)
        let value = 100 / quando_editor.getNumber(block, FONT_SIZE)
        result = `quando.${method}('${div}', 'font-size', '${value}vw');\n`
        return result
      }
    })

    let FONT_TYPE_BLOCK = 'Font'
    let FONT_NAME_MENU = 'font name'
    self.defineStyle({
      name: FONT_TYPE_BLOCK,
      interface: [
        {
          menu: [['Title', '#quando_title'], ['Text', '#quando_text'], ['Labels', '.quando_label']],
          name: DIV_MENU, title: ''
        },
        {
          menu: ['sans-serif', 'Arial', 'Helvetica', 'Arial Black', 'Gadget', 'Comic Sans MS', 'cursive',
            'Impact', 'Charcoal', 'Lucida Sans Unicode', 'Lucida Grande', 'Tahoma', 'Geneva',
            'Trebuchet MS', 'Verdana',
            'serif', 'Georgia', 'Palatino Linotype', 'Book Antiqua', 'Palatino',
            'Times New Roman', 'Times',
            'monospace', 'Courier New', 'Courier',
            'Lucida Console', 'Monaco'],
          name: FONT_NAME_MENU,
          title: ''
        }
      ],
      javascript: (block) => {
        let result = ''
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let div = quando_editor.getMenu(block, DIV_MENU)
        let font_name = quando_editor.getMenu(block, FONT_NAME_MENU)
        result += `quando.${method}('${div}', 'font-family', '${font_name}', ',');\n`
        return result
      }
    })

    let EXPLORATION_RULE = 'Exploration Rule'
    self.defineExperiment({
      name: EXPLORATION_RULE,
      title: 'When',
      interface: [
        { name: 'title', title: '', text: '' },
        { name: 'text', title: '', text: '' },
        {
          extras: [
            { name: 'text3', title: '', text: '' },
            { name: 'text4', title: '', text: '' },
            { name: 'text5', title: '', text: '' }
          ]
        },
        { statement: STATEMENT },
      ]
    })

    let EXPLORATION_ACTION = 'Exploration Action'
    self.defineExperiment({
      name: EXPLORATION_ACTION,
      title: 'Do',
      interface: [
        { name: 'title', title: '', text: '' },
        { name: 'text', title: '', text: '' },
        {
          extras: [
            { name: 'text3', title: '', text: '' },
            { name: 'text4', title: '', text: '' },
            { name: 'text5', title: '', text: '' }
          ]
        }
      ]
    })

    /** Design and functionality of micro:bit toolset. Paired, connected, 
    * and disconnected have been added that determines when a remote micro:bit pairs
    * with an exhibit, and when a connected micro:bit is connected or disconnected from 
    * an exhibit. Visitor identifcation feature.*/
    self.defineDevice({
      name: 'When Device',
      interface: [
        { name: 'name', title: '', text: 'Box' },
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.' + fn + '(' +
          'function() {\n' +
          statement +
          '}' +
          _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
          ');\n'
        return result
      }
    })
    let MICROBIT_GESTURE_MENU = 'MicroBit Gesture'
    self.defineMicrobit({
      name: 'When micro:bit',
      interface: [
        {
          menu: [['Up', 'ubitUp'], ['Down', 'ubitDown'], ['Forward', 'ubitForward'],
          ['Backward', 'ubitBackward'], ['Left', 'ubitLeft'], ['Right', 'ubitRight'],
          ['A Button', 'ubitA'], ['B Button', 'ubitB'], ['Paired', 'ubitPaired'],
          ['Connected', 'ubitConnected'],
          ['Disconnected', 'ubitDisconnected']],
          name: MICROBIT_GESTURE_MENU, title: ''
        },
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let fn = quando_editor.getMenu(block, MICROBIT_GESTURE_MENU)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.ubit.' + fn + '(' +
          'function() {\n' +
          statement +
          '}' +
          _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
          ');\n'
        return result
      }
    })


    /** Design and functionality of "when viewing display" for "the first time" or "again" in the
     * display section of the Quando toolset located in the Quando editor. Visitor Personalisation feature. */
    let VISITOR_STATUS_MENU = 'Visitor Status'
    self.defineDisplay({
      name: 'When viewing the display',
      interface: [
        {
          menu: [['for the first time', 'visitorFirst'],
          ['again', 'visitorReturn']],
          name: VISITOR_STATUS_MENU, title: ''
        },
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let fn = quando_editor.getMenu(block, VISITOR_STATUS_MENU)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.visitor.' + fn + '(' +
          'function() {\n' +
          statement +
          '}' +
          _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
          ');\n'
        return result
      }
    })

    /** Block design and functionality of custom URL block located in the
     * display section of the Quando toolset located in the Quando editor.
     *  Extended feature. */
    let Width = 'Width'
    let Height = 'Height'
    let WEBSITE = 'Website'
    self.defineDisplay({
      name: 'Open website',
      interface: [
        {
          name: WEBSITE,
          title: '"',
          text: 'Type website URL here...'
        }, { title: '"' },
        {
          extras: [
            { title: 'Width', name: Width, number: 700 }, { title: 'cm' },
            { title: 'Height', name: Height, number: 500 }, { title: 'cm' }
          ]
        },
      ],
      javascript: (block) => {
        websiteURL = quando_editor.getText(block, WEBSITE)
        let extras = {}
        let widthVal = quando_editor.getNumber(block, Width)
        let heightVal = quando_editor.getNumber(block, Height)
        if (websiteURL != "Type website URL here...") {
          return "window.open(" + "'http://" + websiteURL + "', 'Visitor Window'," + "'width=" + widthVal + ",height=" + heightVal + "')"
        } else {
          return 'alert("Please enter a valid URL into the Open Website block. " +' + "\n" + '"For example: www.google.co.uk");'

        }
      }
    })

    /** Design and fucntionality of visitor proximity detection block that is located in the visitor section
     * of the Quando toolset located in the Quando editor. Visitor proximity identification and detection feature. */
    let VISITOR_PROXIMITY_MENU = 'Visitor proximity'
    self.defineVisitor({
      name: 'When visitor',
      interface: [
        {
          menu: [['is close to the exhibit', 'ubitClose'],
          ['is far away from the exhibit', 'ubitFar'], ['has left the exhibit', 'ubitVisitor']],
          name: VISITOR_PROXIMITY_MENU, title: ''
        },
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let fn = quando_editor.getMenu(block, VISITOR_PROXIMITY_MENU)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.ubit.' + fn + '(' +
          'function() {\n' +
          statement +
          '}' +
          _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
          ');\n'
        return result
      }
    })

    /** Design and fucntionality of visitor identity block that is located in the visitor section
     * of the Quando toolset located in the Quando editor. Visitor proximity 
     * identification and personalisation feature. */
    let VISITOR_IDENTITY_MENU = 'Visitor Identity'
    self.defineVisitor({
      name: 'Visitor Identity',
      interface: [
        {
          menu: [['1', 'visitorIdentity1'],
          ['2', 'visitorIdentity2']],
          name: VISITOR_IDENTITY_MENU, title: ''
        },
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let fn = quando_editor.getMenu(block, VISITOR_IDENTITY_MENU)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.visitor.' + fn + '(' +
          'function() {\n' +
          statement +
          '}' +
          _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
          ');\n'
        return result
      }
    })

    /** Design and fucntionality of deletion block that is located in the visitor section
     * of the Quando toolset located in the Quando editor. Extended feature that 
     * complements visitor personalisation. */
    let VISITOR_DELETE_MENU = 'Visitor Delete'
    self.defineVisitor({
      name: 'After visitor records are cleared from the system',
      interface: [
        {

          name: VISITOR_DELETE_MENU, title: ''
        },
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let fn = quando_editor.getMenu(block, VISITOR_DELETE_MENU)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.visitor.visitorDelete' + '(' +
          'function() {\n' +
          statement +
          '}' +
          _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
          ');\n'
        return result
      }
    })



    getJSON('http://127.0.0.1/client/js/',
      function (err, data) {
        if (err != null) {
          alert('Something went wrong: ' + err);
        } else {
          //  alert(data.files);
          for (var i = 0; i < data.files.length; i++) {
            exhibitsList[i] = data.files[i] + '\n';
          }
        }
      });

    // Build the drop down list of deployed js files (exhibit names)
    let _exhibit_menu = () => {
      let choices = [['-----', 0]]
      for (var i = 0; i < exhibitsList.length; i++) {
        choices.push([String(exhibitsList[i])])
      }
      //  }
      return choices
    }

    /** Design of future work proposed block that allows the selection of specific exhibits 
     * to initiate specific functionality a visitor has interacted witht he specified exhibit.
     * No functionality, only design of block. */
    let EXHIBIT_TO_MENU = ''
    let SHOW_EXHIBIT_LIST = 'When Visitor has viewed'
    let VISITOR_EXHIBIT_MENU = 'Visitor Exhibit'
    self.defineVisitor({
      name: SHOW_EXHIBIT_LIST,
      interface: [{
        menu: _exhibit_menu,
        name: VISITOR_EXHIBIT_MENU, title: ''
      },
      { title: 'before' },
      { statement: STATEMENT }
      ],
      javascript: (block) => {
        let fn = quando_editor.getMenu(block, VISITOR_EXHIBIT_MENU)
        exhibit = JSON.stringify(fn)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.visitor.visitorExhibit(' +
          'function() {\n' +
          statement +
          '}' +
          _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
          ');\n'
        return result
      }
    })

    /** Design and functionality of opening a pre-created HTML page (logion /register).
     * Visitor indetifaction and personalisation feature.*/
    let WEBSITE_MENU = 'Website selection'
    self.defineVisitor({
      name: 'Open visitor',
      interface: [
        {
          menu: [['Login Webpage', 'http://127.0.0.1/visitorLogin/'],
          ['Login Update Account Webpage', 'http://127.0.0.1/visitorLoginUpdate/'],
          ['Register Webpage', 'http://127.0.0.1/visitorRegister/'],
          ['Register Update Webpage', 'http://127.0.0.1/visitorRegisterUpdate/']],
          name: WEBSITE_MENU, title: ''
        },
      ],
      javascript: (block) => {
        let webpage = quando_editor.getMenu(block, WEBSITE_MENU)
        var w = 600;
        var h = 750;
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        return "window.open('" + webpage + "', 'Visitor Window','width=" + w + ", height=" + h + ",top=" + top + ",left=" + left + "')\n"
      }
    })

    /** Design and functionality of alternative variation of opening a pre-created HTML page (logion /register).
     * Variation allows a user to specify when the chosen webpage is opened in correspondence to the visitors
     * interaction (entry/ exit). Visitor indetifaction and personalisation feature.*/
    let VISITOR_STATE_MENU = 'Visitor State'
    let VISITOR_WEBSITE_MENU = 'Visitor Website'
    self.defineVisitor({
      name: 'Open Visitor',
      interface: [
        {
          menu: [['Login Webpage', 'http://127.0.0.1/visitorLogin/'],
          ['Login Update Account Webpage', 'http://127.0.0.1/visitorLoginUpdate/'],
          ['Register Webpage', 'http://127.0.0.1/visitorRegister/'],
          ['Register Update Webpage', 'http://127.0.0.1/visitorRegisterUpdate/']],
          name: VISITOR_WEBSITE_MENU, title: ''
        },
        {
          menu: [['Entry', 'visitorEntry'],
          ['Exit', 'visitorExit']],
          name: VISITOR_STATE_MENU, title: 'upon'
        },
      ],
      javascript: (block) => {
        let fn = quando_editor.getMenu(block, VISITOR_STATE_MENU)
        let website = quando_editor.getMenu(block, VISITOR_WEBSITE_MENU)
        let result = 'quando.visitor.' + fn + '(' +
          'function() {\n' + "window.open('" + website + "', 'Visitor Window', 'width=700,height=500')" +
          '}' +
          _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
          ');\n'
        return result
      }
    })

    let LEAP_GESTURE_MENU = 'Leap Gesture Menu'
    self.defineLeap({
      name: 'When Leap',
      interface: [
        { menu: [['Fist', 'handClosed'], ['Flat', 'handOpen']], name: LEAP_GESTURE_MENU, title: '' },
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let fn = quando_editor.getMenu(block, LEAP_GESTURE_MENU)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = `quando.leap.${fn}(\nfunction() {\n` +
          statement +
          '}' +
          _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
          ');\n'
        return result
      }
    })

    let WHEN_IDLE = 'When Idle for'
    let ACTIVE_STATEMENT = 'ACTIVE_STATEMENT'
    self.defineTime({
      name: WHEN_IDLE,
      next: false,
      previous: false,
      interface: [
        { name: DURATION, title: '', number: '1' }, MENU_UNITS_MINS,
        { statement: STATEMENT },
        { row: 'Then When Active', statement: ACTIVE_STATEMENT }
      ],
      javascript: (block) => {
        let seconds = quando_editor.getNumber(block, DURATION)
        if (quando_editor.getMenu(block, MENU_UNITS_MINS.name) === 'Minutes') {
          seconds *= 60
        }
        let statement = quando_editor.getStatement(block, STATEMENT)
        let active_statement = quando_editor.getStatement(block, ACTIVE_STATEMENT)
        let result = 'quando.idle(' +
          seconds +
          ', function() {\n' + statement + '}, function() {\n' +
          active_statement + '});\n'
        return result
      }
    })

    self.defineTime({
      name: 'Check',
      interface: [
        { name: FREQUENCY, title: '', number: 1 },
        {
          menu: ['Second', 'Minute', 'Hour', 'Day'],
          name: UNITS_MENU,
          title: 'times per'
        },
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let frequency = quando_editor.getNumber(block, FREQUENCY)
        let seconds = 1
        switch (quando_editor.getMenu(block, UNITS_MENU)) {
          case 'Minute': seconds = 60
            break
          case 'Hour': seconds = 60 * 60
            break
          case 'Day': seconds = 60 * 60 * 24
            break
        };
        let time = seconds / frequency
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = 'quando.every(' +
          time +
          ', function() {\n' +
          statement +
          '}' +
          _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
          ');\n'
        return result
      }
    })

    let CONTENT_POSITION = 'Position'
    let DIRECTION_MENU = 'Direction'
    let POSITION_SIZE = 'Position Size'
    self.defineClient({
      name: CONTENT_POSITION,
      interface: [
        {
          menu: [['Title', '#quando_title'], ['Text', '#quando_text'], ['Labels', '#quando_labels']],
          name: DIV_MENU, title: ''
        },
        { name: POSITION_SIZE, title: '', number: 0 }, { title: '%' },
        { menu: ['top', 'bottom', 'left', 'right'], name: DIRECTION_MENU, title: 'from' }
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let div = quando_editor.getMenu(block, DIV_MENU)
        let direction = quando_editor.getMenu(block, DIRECTION_MENU)
        let value = quando_editor.getNumber(block, POSITION_SIZE)
        result = `quando.${method}('${div}', '${direction}', '${value}%');\n`
        if (direction == 'bottom') {
          result += `quando.${method}('${div}', 'top', 'unset');\n` // override the set top 0px
        } else if (direction == 'right') {
          result += `quando.${method}('${div}', 'left', 'unset');\n` // override the set left
        }
        return result
      }
    })

    let CONTENT_SIZE = 'Size'
    let DIMENSION_MENU = 'Dimension'
    self.defineClient({
      name: CONTENT_SIZE,
      interface: [
        {
          menu: [['Title', '#quando_title'], ['Text', '#quando_text'], ['Labels', '#quando_labels']],
          name: DIV_MENU, title: ''
        },
        { name: POSITION_SIZE, title: '', number: 100 }, { title: '%' },
        { menu: ['height', 'width'], name: DIMENSION_MENU, title: 'of' }
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let div = quando_editor.getMenu(block, DIV_MENU)
        let dimension = quando_editor.getMenu(block, DIMENSION_MENU)
        let value = quando_editor.getNumber(block, POSITION_SIZE)
        result = `quando.${method}('${div}', '${dimension}', '${value}%');\n`
        return result
      }
    })

    let PROJECTION_ACTION = 'Projection Action'
    self.defineDisplay({
      name: PROJECTION_ACTION,
      title: '',
      interface: [
        { name: 'front_rear', menu: ['Normal', 'Rear'], title: '' },
        { title: 'Projection' }
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let front_rear = quando_editor.getMenu(block, 'front_rear')
        let scale = '1,1'
        if (front_rear == 'Rear') {
          scale = '-1,1'
        }
        result = `quando.${method}('html', 'transform', 'scale(${scale})');\n`
        return result
      }
    })

    function _clamp_degrees(degrees) {
      return degrees >= 0 ? degrees % 360 : (degrees % 360) + 360 // necessary since % of negatives don't work ?!
    }

    let VALUE_CURSOR = 'Change Cursor'
    let CHANGE_CURSOR_MENU = 'Cursor menu'
    let DEVICE_LEFT_RIGHT = '\u21D4'
    let DEVICE_UP_DOWN = '\u21D5'
    let CHANGE_MID_VALUE = 'Middle'
    let CHANGE_PLUS_MINUS = 'plus minus'
    self.defineCursor({
      name: VALUE_CURSOR, title: ICON_CONSUME_VALUE + ' Change Cursor',
      interface: [
        {
          name: CHANGE_CURSOR_MENU,
          title: '',
          menu: [[DEVICE_LEFT_RIGHT, 'quando.cursor_left_right'],

          [DEVICE_UP_DOWN, 'quando.cursor_up_down']]
        },
        {
          extras: [
            { name: CHANGE_MID_VALUE, number: 50 }, { title: '%' },
            { name: CHANGE_PLUS_MINUS, title: '+/-', number: 50 }, { title: '%' }
          ]
        },
      ],
      javascript: (block) => {
        let fn = quando_editor.getMenu(block, CHANGE_CURSOR_MENU)
        let extras = {}
        let mid = quando_editor.getNumber(block, CHANGE_MID_VALUE) / 100
        let plus_minus = quando_editor.getNumber(block, CHANGE_PLUS_MINUS) / 100
        // converted to 0..1 format
        extras.min = mid - plus_minus
        extras.max = mid + plus_minus
        extras = JSON.stringify(extras)
        let result = `${fn}(val, ${extras});\n`
        return result
      }
    })

    let MOVE_3D_OBJECT = 'Change 3D Object'
    let CHANGE_3D_OBJECT_MENU = '3D Object menu'
    self.defineDevice({
      name: MOVE_3D_OBJECT, title: ICON_CONSUME_VALUE + ' Move 3D Object',
      interface: [
        {
          name: CHANGE_3D_OBJECT_MENU,
          title: '',
          menu: [
            [DEVICE_LEFT_RIGHT, 'quando.object3d.left_right'],
            [DEVICE_UP_DOWN, 'quando.object3d.up_down'],
            ['Zoom', 'quando.object3d.in_out']]

        },
        {
          extras: [
            { name: CHANGE_MID_VALUE, number: 0 }, { title: 'cm' },
            { name: CHANGE_PLUS_MINUS, title: '+/-', number: 5 }, { title: 'cm' }
          ]
        },
      ],
      javascript: (block) => {
        let fn = quando_editor.getMenu(block, CHANGE_3D_OBJECT_MENU)
        let extras = {}
        // convert to mm
        let mid = 10 * quando_editor.getNumber(block, CHANGE_MID_VALUE)
        let plus_minus = 10 * quando_editor.getNumber(block, CHANGE_PLUS_MINUS)
        extras.min = mid - plus_minus
        extras.max = mid + plus_minus
        extras = JSON.stringify(extras)
        let result = `${fn}(val, ${extras});\n`
        return result
      }
    })

    let ROTATE_3D_OBJECT = 'Rotate 3D Object'
    let ROTATE_3D_OBJECT_MENU = '3D Object menu'
    let CHANGE_MID_ANGLE = 'Change Angle'
    self.defineDevice({
      name: ROTATE_3D_OBJECT, title: ICON_CONSUME_VALUE + ' Rotate 3D Object',
      interface: [
        {
          name: ROTATE_3D_OBJECT_MENU,
          title: '',
          menu: [
            ['\u21D4 Yaw', 'quando.object3d.yaw'],
            ['\u21D5 Pitch', 'quando.object3d.pitch'],
            ['\u2939\u2938 Roll', 'quando.object3d.roll']]

        },
        {
          extras: [
            { name: CHANGE_MID_ANGLE, title: '', number: 0 }, { title: 'degrees' },
            { name: CHANGE_PLUS_MINUS, title: '+/-', number: 180 }, { title: 'degrees' }
          ]
        },
      ],
      javascript: (block) => {
        let fn = quando_editor.getMenu(block, CHANGE_3D_OBJECT_MENU)
        let extras = {}
        let mid = quando_editor.getNumber(block, CHANGE_MID_ANGLE)
        let plus_minus = quando_editor.getNumber(block, CHANGE_PLUS_MINUS)
        extras.min = mid - plus_minus
        extras.max = mid + plus_minus
        extras = JSON.stringify(extras)
        let result = `${fn}(val, ${extras});\n`
        return result
      }
    })


    let CHANGE_WITH_MICROBIT_ANGLE = 'When micro:bit angle '
    let CHANGE_VARIABLE = 'Variable'
    let CHANGE_ROLL = '\u2939\u2938 Roll'
    let CHANGE_PITCH = '\u21D5 Pitch'
    let CHANGE_HEADING = '\u21D4 Heading'
    let CHANGE_MAG_X = 'Mag X'
    let CHANGE_MAG_Y = 'Mag Y'
    let CHECK_INVERTED = 'Inverted'

    self.defineMicrobit({
      name: CHANGE_WITH_MICROBIT_ANGLE, title: 'When micro:bit angle',
      interface: [
        {
          name: CHANGE_VARIABLE, title: '',
          menu: [CHANGE_HEADING, CHANGE_PITCH, CHANGE_ROLL,
            // CHANGE_MAG_X, CHANGE_MAG_Y

          ]
        },
        { title: ICON_PRODUCE_VALUE },
        {
          extras: [
            { name: CHANGE_MID_ANGLE, title: '', number: 0 }, { title: 'degrees' },
            { name: CHANGE_PLUS_MINUS, title: '+/-', number: 25 }, { title: 'degrees' },
            { name: CHECK_INVERTED, check: false }
          ]
        },
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let variable = quando_editor.getMenu(block, CHANGE_VARIABLE)
        switch (variable) {
          case CHANGE_ROLL: variable = 'handleRoll'
            break
          case CHANGE_PITCH: variable = 'handlePitch'
            break
          case CHANGE_HEADING: variable = 'handleHeading'
            break
          case CHANGE_MAG_X: variable = 'handleMagX'
            break
          case CHANGE_MAG_Y: variable = 'handleMagY'
            break
        }
        let extras = {}
        extras.mid_angle = _clamp_degrees(quando_editor.getNumber(block, CHANGE_MID_ANGLE))
        extras.plus_minus = quando_editor.getNumber(block, CHANGE_PLUS_MINUS)
        if (quando_editor.getCheck(block, CHECK_INVERTED)) {
          extras['inverted'] = true
        }
        extras = JSON.stringify(extras)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = `quando.ubit.${variable}(function(val) {\n${statement}}, ${extras}` +
          _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
          ');\n'
        return result
      }
    })

    let CHANGE_WITH_LEAP_DISTANCE = 'When Leap move'
    let LEAP_LEFT_RIGHT = '\u21D4'
    let LEAP_HEIGHT = '\u21D5'
    let LEAP_DEPTH = '\u2922 In-Out'
    self.defineLeap({
      name: CHANGE_WITH_LEAP_DISTANCE,
      interface: [
        {
          name: CHANGE_VARIABLE,
          title: '',
          menu: [LEAP_LEFT_RIGHT, LEAP_HEIGHT, LEAP_DEPTH]
        },
        { title: ICON_PRODUCE_VALUE },
        {
          extras: [
            { name: CHANGE_PLUS_MINUS, title: '+/-', number: 15 }, { title: 'cm' },
            { name: CHECK_INVERTED, check: false }
          ]
        },
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let extras = {}
        // convert to mm
        let plus_minus = 10 * quando_editor.getNumber(block, CHANGE_PLUS_MINUS)
        extras.min = -plus_minus
        extras.max = plus_minus
        let variable = quando_editor.getMenu(block, CHANGE_VARIABLE)
        switch (variable) {
          case LEAP_LEFT_RIGHT: variable = 'X'
            break
          case LEAP_HEIGHT: variable = 'Y'
            extras.min = 100 // 10 cm is minimum height set
            extras.max = 2 * plus_minus + 100 // set to the right height...
            break
          case LEAP_DEPTH: variable = 'Z'
            break
        }
        if (quando_editor.getCheck(block, CHECK_INVERTED)) {
          extras['inverted'] = true
        }
        extras = JSON.stringify(extras)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = `quando.leap.handle${variable}(function(val) {\n${statement}}, ${extras}` +
          _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
          ');\n'
        return result
      }
    })

    let CHANGE_WITH_LEAP_ANGLE = 'When Leap angle'
    let CHANGE_YAW = '\u21D4 Yaw'
    self.defineLeap({
      name: CHANGE_WITH_LEAP_ANGLE,
      interface: [
        {
          name: CHANGE_VARIABLE,
          title: '',
          menu: [CHANGE_YAW, CHANGE_PITCH, CHANGE_ROLL]
        },
        { title: ICON_PRODUCE_VALUE },
        {
          extras: [
            { name: CHANGE_MID_ANGLE, title: '', number: 0 }, { title: 'degrees' },
            { name: CHANGE_PLUS_MINUS, title: '+/-', number: 25 }, { title: 'degrees' },
            { name: CHECK_INVERTED, check: false }
          ]
        },
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let variable = quando_editor.getMenu(block, CHANGE_VARIABLE)
        switch (variable) {
          case CHANGE_ROLL: variable = 'Roll'
            break
          case CHANGE_PITCH: variable = 'Pitch'
            break
          case CHANGE_YAW: variable = 'Yaw'
            break
        }
        let extras = {}
        extras.mid_angle = _clamp_degrees(quando_editor.getNumber(block, CHANGE_MID_ANGLE))
        extras.plus_minus = quando_editor.getNumber(block, CHANGE_PLUS_MINUS)
        if (quando_editor.getCheck(block, CHECK_INVERTED)) {
          extras['inverted'] = true
        }
        extras = JSON.stringify(extras)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let result = `quando.leap.handle${variable}(function(val) {\n${statement}\n}, ${extras}` +
          _getOnContained(block, [WHEN_VITRINE_BLOCK], '', ', false') +
          ');\n'
        return result
      }
    })

    let SHOW_OBJECT3D = 'Object3D'
    let FILE_OBJECT3D = '\uD83C\uDF81 Show 3D Object'
    self.defineMedia({
      name: SHOW_OBJECT3D,
      title: '',
      interface: [{ name: FILE_OBJECT3D, file: 'objects' }],
      javascript: (block) => {
        let object3d = quando_editor.getFile(block, FILE_OBJECT3D)
        // return `quando.object3d.loadOBJ('/client/media/', '${object3d}');\n`
        return `quando.object3d.loadGLTF('/client/media/${object3d}');\n`
      }
    })

    let DESCRIPTION_BLOCK = 'Description'
    let DESCRIPTION_TEXT = 'description_text'
    self.defineAdvanced({
      name: DESCRIPTION_BLOCK, title: ' ',
      interface: [{ name: DESCRIPTION_TEXT, title: ' ', text: '' },
      { statement: STATEMENT }
      ],
      javascript: (block) => {
        let description = quando_editor.getText(block, DESCRIPTION_TEXT)
        let statement = quando_editor.getStatement(block, STATEMENT)
        let infix = ''
        if (description != '') {
          infix = ` // ${description}`
        }
        return `{${infix}\n${statement}}\n`
      }
    })

    let SCRIPT_BLOCK = 'Javascript: '
    let SCRIPT_TEXT = 'script_text'
    self.defineAdvanced({
      name: SCRIPT_BLOCK,
      interface: [{ name: SCRIPT_TEXT, title: '', text: '' }
      ],
      javascript: (block) => {
        let script = quando_editor.getRawText(block, SCRIPT_TEXT)
        return `${script};\n`
      }
    })

    let CURSOR_COLOUR_BLOCK = 'Cursor Opacity'
    let OPACITY = 'Opacity'
    self.defineCursor({
      name: CURSOR_COLOUR_BLOCK, title: 'Cursor',
      interface: [
        { name: COLOUR, title: '', colour: '#ffcc00' },
        { name: OPACITY, title: 'Opacity', number: 70 }, { title: '%' }
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let opacity = quando_editor.getNumber(block, OPACITY) / 100
        let colour = quando_editor.getColour(block, COLOUR)
        let bigint = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colour)
        let r = parseInt(bigint[1], 16)
        let g = parseInt(bigint[2], 16)
        let b = parseInt(bigint[3], 16)
        colour = `rgba(${r}, ${g}, ${b}, ${opacity})`
        result = `quando.${method}('#cursor', 'background-color', '${colour}');\n`
        return result
      }
    })

    let CURSOR_SIZE_BLOCK = 'Cursor'
    let SIZE = 'Size'
    self.defineCursor({
      name: CURSOR_SIZE_BLOCK,
      interface: [
        { name: SIZE, title: 'Size', number: 4.4 }, { title: '% of width' },
      ],
      javascript: (block) => {
        let method = _getStyleOnContained(block, [WHEN_VITRINE_BLOCK, WHEN_IDLE])
        let size = quando_editor.getNumber(block, SIZE)
        let margin = -size / 2
        result = `quando.${method}('#cursor', ['width','height'], '${size}vw');\n`
        result += `quando.${method}('#cursor', ['margin-left', 'margin-top'], '${margin}vw');\n`
        return result
      }
    })

    function _getIndividualChildCode(start, prefix, postfix, separator) {
      let result = ''
      let child = start
      while (child != null) {
        let code = quando_editor.getIndividualBlockCode(child)
        if (result != '') {
          result += separator
        }
        result += prefix + code + postfix
        child = child.getNextBlock()
      }
      return result
    }

    let PICK_RANDOM_BLOCK = 'Pick one at Random'
    self.defineAdvanced({
      name: PICK_RANDOM_BLOCK, title: '\uD83C\uDFB2 Pick Random',
      interface: [
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let stateBlock = block.getInputTargetBlock(STATEMENT)
        let arr = _getIndividualChildCode(stateBlock, 'function(){\n', '}', ',\n')
        return `quando.pick_random([\n${arr}\n])\n`
      }
    })

    let PICK_ONE_BLOCK = 'Pick one'
    self.defineAdvanced({
      name: PICK_ONE_BLOCK, title: ICON_CONSUME_VALUE + PICK_ONE_BLOCK,
      interface: [
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let id = block.id
        let stateBlock = block.getInputTargetBlock(STATEMENT)
        let arr = _getIndividualChildCode(stateBlock, 'function(){\n', '}', ',\n')
        quando_editor.pushToSetup(`quando.setOnId('${id}', [${arr}])\n`)
        return `quando.pick(val, quando.getOnId('${id}'))\n`
      }
    })

    let PICK_ONE_EACH_BLOCK = 'Pick one each time'
    self.defineAdvanced({
      name: PICK_ONE_EACH_BLOCK,
      interface: [
        { statement: STATEMENT }
      ],
      javascript: (block) => {
        let id = block.id
        let stateBlock = block.getInputTargetBlock(STATEMENT)
        let arr = _getIndividualChildCode(stateBlock, 'function(){\n', '}', ',\n')
        quando_editor.pushToSetup(`quando.setOnId('${id}', [${arr}])\n`)
        return `quando.pick_one_each_time(quando.getOnId('${id}'))\n`
      }
    })

  } // self.addBlocks
})()
