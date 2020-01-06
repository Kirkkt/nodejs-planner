const fs = require('fs');

const MODE_NORMAL = 'mode_normal'
const MODE_MOVE = 'mode_move'
const MODE_INSERT_TEXT = 'mode_insert_text'
const MODE_INSERT_DAYS = 'mode_insert_days'
const FILE_NAME = 'items.json'

const START_DATE = new Date('Jan 05, 2020')
const ONE_DAY = 24 * 60 * 60 * 1000

const formatLine = ({ text, days , startDate }) => {
  const date = new Date(Number(startDate) + days * ONE_DAY)
  return `${text} ===${days}d===> ${date.toLocaleDateString()}`
}

const clearScreen = () => {
  const readline = require('readline')
  const blank = '\n'.repeat(process.stdout.rows)
  console.log(blank)
  readline.cursorTo(process.stdout, 0, 0)
  readline.clearScreenDown(process.stdout)
}

const renderContent = (items, highlightIndex, mode) => {
  clearScreen()
  items.reduce(
    (items, {text, days}) => [
      ...items,
      {
        text,
        days,
        startDate: new Date((items.length > 0 ? items[items.length - 1].days : 0) * ONE_DAY + Number(items.length > 0 ?
          items[items.length - 1].startDate : START_DATE)),
      }
    ],
    []
  ).forEach((item, index) => {
    if (index === highlightIndex && mode === MODE_MOVE) {
      console.log('' + formatLine(item) + ' <<<');
    } else if (index === highlightIndex) {
      console.log('> ' + formatLine(item));
    } else {
      console.log('  ' + formatLine(item));
    }
  })
}

const renderInsertTextMode = (str, key, inputText) => {
  if (key.name === 'escape') {
    return {
      mode: MODE_NORMAL,
      inputText: '',
    }
  } else if (key.name === 'return') {
    return {
      mode: MODE_INSERT_DAYS,
      inputText,
    }
  } else if (key.name === 'backspace') {
    return {
      mode: MODE_INSERT_TEXT,
      inputText: inputText.substr(0, inputText.length - 1),
    }
  } else if (key.ctrl && key.name === 'u') {
    return {
      mode: MODE_INSERT_TEXT,
      inputText: '',
    }
  } else if (str && str.length === 1) {
    return {
      mode: MODE_INSERT_TEXT,
      inputText: inputText + str,
    }
  } else {
    return {
      mode: MODE_INSERT_TEXT,
      inputText,
    }
  }
}

const renderInsertDaysMode = (str, key, inputDays) => {
  if (key.name === 'escape') {
    return {
      mode: MODE_NORMAL,
      inputDays: '',
    }
  } else if (key.name === 'return') {
    return {
      mode: MODE_NORMAL,
      inputDays,
    }
  } else if (key.name === 'backspace') {
    return {
      mode: MODE_INSERT_DAYS,
      inputDays: inputDays.substr(0, inputDays.length - 1),
    }
  } else if (key.ctrl && key.name === 'u') {
    return {
      mode: MODE_INSERT_DAYS,
      inputDays: '',
    }
  } else if (str && str.length === 1) {
    return {
      mode: MODE_INSERT_DAYS,
      inputDays: inputDays + str,
    }
  } else {
    return {
      mode: MODE_INSERT_DAYS,
      inputDays,
    }
  }
}

const captureKeyPress = (items) => {
  const readline = require('readline');
  let highlightIndex = 0;
  let mode = MODE_NORMAL
  let inputText = ''
  let inputDays = ''
  renderContent(items, highlightIndex, mode);
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      process.exit();
    } else if (mode === MODE_INSERT_TEXT) {
      const returnValue = renderInsertTextMode(str, key, inputText)
      mode = returnValue.mode
      inputText = returnValue.inputText
      clearScreen()
      console.log(inputText)
      if (mode === MODE_NORMAL) {
        inputText = ''
        inputDays = ''
        renderContent(items, highlightIndex, mode)
      } else if (mode === MODE_INSERT_DAYS) {
        clearScreen()
        console.log(inputDays)
      }
    } else if (mode === MODE_INSERT_DAYS) {
      const returnValue = renderInsertDaysMode(str, key, inputDays)
      mode = returnValue.mode
      inputDays = returnValue.inputDays
      clearScreen()
      console.log(inputDays)
      if (mode === MODE_NORMAL) {
        if (inputText && inputDays && !isNaN(Number(inputDays)) && Number(inputDays) > 0) {
          items.push({
            text: inputText,
            days: inputDays,
          })
        }
        inputText = ''
        inputDays = ''
        renderContent(items, highlightIndex, mode)
      }
    } else if (str === 'j' && highlightIndex < items.length - 1) {
      if (mode === MODE_MOVE) {
        [ items[highlightIndex], items[highlightIndex + 1] ] = [ items[highlightIndex + 1], items[highlightIndex] ]
      }
      highlightIndex++
      renderContent(items, highlightIndex, mode);
    } else if (str === 'k' && highlightIndex > 0) {
      if (mode === MODE_MOVE) {
        [ items[highlightIndex], items[highlightIndex - 1] ] = [ items[highlightIndex - 1], items[highlightIndex] ]
      }
      highlightIndex--
      renderContent(items, highlightIndex, mode);
    } else if (str === 'v') {
      mode = (mode === MODE_MOVE ? MODE_NORMAL : MODE_MOVE)
      renderContent(items, highlightIndex, mode);
    } else if (str === 'a') {
      mode = MODE_INSERT_TEXT
      clearScreen()
    } else if (str === 'D') {
      // TODO: delete in visual mode
      items.splice(highlightIndex, 1)
      if (highlightIndex >= items.length) {
        highlightIndex = Math.max(items.length - 1, 0)
      }
      renderContent(items, highlightIndex, mode);
    } else if (str === 'w') {
      fs.writeFile(FILE_NAME, JSON.stringify(items), 'utf8', function (err) {
        if (err) {
          console.log(err)
        }
      })
    }
  });
}

fs.readFile(FILE_NAME, 'utf-8', function read(err, data) {
  if (err) {
    console.log(err)
  } else {
    captureKeyPress(JSON.parse(data))
  }
})
