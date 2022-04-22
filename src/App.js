import { useState, useEffect, useRef } from 'react';
import './App.css';

const getLocaleItems = () => {
  let list = localStorage.getItem('history');

  if (list) {
    let parse = JSON.parse(list);
    return parse;
  } else {
    return [];
  }
}

function App() {

  const [answer, setAnswer] = useState("0");
  const [finalResult, setFinalResult] = useState([]);
  const [history, setHistory] = useState(getLocaleItems());
  const [temp, settemp] = useState('');
  const exp = useRef()

  var keysCodes = [8, 13, 27, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 109, 110, 111, 187, 189, 191]

  var specialChar = ["!", "@", "#", "$", "%", "^", "&", "(", ")", "?", "_"]

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]

  const symbols = ["+", "-", "*", "/", '=']

  const [onlyDigits, setonlyDigits] = useState([])

  const handleKeyPress = (key, keyCode) => {
    if (!keyCode) return;
    else if (keyCode === 8) deleteItem();
    else if (keyCode === 27) clear();
    else if (keyCode === 13 || keyCode === 187 && key === '=') {
      dispTotal(key)
    } else if ((keyCode !== 13 || keyCode !== 187 && key === '=') && keyCode !== 8 && keysCodes.includes(keyCode) && !(specialChar.includes(key))) {
      display(key)
    };
  }

  const clear = () => {
    setAnswer('');
    setFinalResult(0)
  }

  const display = (digit) => {
    // if (symbols.includes(answer.slice(-1)) && symbols.includes(digit)) return;
    if (answer.length >= 20) exp.current.scrollLeft  += 100;

    if (digit === '0' && answer === '0' || digit === '0' && symbols.includes(answer.slice(-1))) return;

    else if (symbols.includes(digit) && answer === '0') return;

    else if(answer === '' && symbols.includes(digit)) return;

    else if (digit === '.' && answer === '0') setAnswer(answer.concat(digit));

    else if (digit === '.' && answer.slice(-1) === '.') return;

    else if (digit === '.' && (answer.slice(-1) === '' || symbols.includes(answer.slice(-1)))) setAnswer(answer.concat('0').concat(digit)); 
    
    else if (digit === '.' && answer.includes('.') ) {
      let data = symbols.find(ele => answer.includes(ele));
      console.log(data)
      if(data){
        let x = answer.split(data)
        if(!(x.slice(-1)[0].includes('.'))){
          setAnswer(answer.concat(digit))
        }
      } else{
        return;
      }
    }
    
    else if (answer === '0') {
      setonlyDigits([...onlyDigits, digit])
      setAnswer(digit);
    }

    else if (digit !== '=') {
      
      if (temp && symbols.includes(digit)) {
        setAnswer(eval(answer) % 1 === 0 ? temp.toFixed(0).concat(digit) : temp.toFixed(1).concat(digit))

        document.querySelector('.result').classList.add('animTop');
        document.querySelector('.expression').style.opacity = 0;

        settemp('');

        setTimeout(() => {
          document.querySelector('.result').style.opacity = 0;
          document.querySelector('.expression').style.opacity = 1;
        }, 300);
      } else if(temp){
        setAnswer(digit)
        settemp('')
      } else {
        if (keys.includes(digit)) {
          setonlyDigits([...onlyDigits, digit])
          if (onlyDigits.length < 15) {
            setAnswer(answer.concat(digit).toString())
          } else {
            setFinalResult("limit exceeded")
            return;
          }
        }
        else {
          let x='';
          if (answer && symbols.includes(answer.slice(-1)) && symbols.includes(digit)) {
            x = answer.split("").slice(0,answer.length - 1);
            x.push(digit)
            setAnswer(x.join(''));
          }else{
            setonlyDigits([])
            setFinalResult('')  
            let x = eval(answer.split('').slice(0,answer.length).join(''))
            setAnswer(x.toString().concat(digit).toString())
          }
        }
        document.querySelector('.result').classList.remove('animTop');
      }
    }

  }

  const deleteItem = () => {
    setAnswer(answer.slice(0, -1))
  }

  const dispTotal = () => {
    if (symbols.includes(answer.slice(-1))) return;

    let historyObj = {
      expression: answer,
      answer: eval(answer).toFixed(1)
    }

    if (history.length > 10) {
      setHistory(history.slice(-1))
    } else {
      setHistory([...history, historyObj])
    }

    document.querySelector('.result').style.opacity = 1;
    settemp(eval(answer))
    setFinalResult(eval(answer) % 1 === 0 ? eval(answer) : eval(answer).toFixed(1))
  }

  const showhistory = (e) => {
    e.preventDefault();

    let historyEle = document.querySelector('.show-history');

    if (historyEle.style.display === "block") {
      historyEle.style.display = "none"
    } else {
      historyEle.style.display = "block";
      if (history.length >= 1) historyEle.lastChild.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    }
  }

  useEffect(() => {
    if (history.length >= 1) document.querySelector('.show-history').lastChild.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    localStorage.setItem('history', JSON.stringify(history))
  }, [history])

  window.addEventListener('load', () => {
    document.querySelector('.App').focus();
  })

  return (
    <div className="App" style={{ display: "flex", alignItems: "center", height: "calc(100vh - 100px)" }} tabIndex={0} onKeyDown={(e) => handleKeyPress(e.key, e.keyCode)}>

      <div className='main-container'>
        <div className='display'>
          <a className='btn-history' onClick={showhistory}>History</a>
          <div style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end"
          }}>
            <div className='show-history'>
              {
                history && history.map((ele, index) =>
                (
                  <p className='history' key={index} style={{ padding: '2px', color: "grey" }}>{ele.expression} = {ele.answer}</p>
                )
                )
              }
            </div>
            <div style={{ marginTop: "20px" }}>
              <p ref={exp} className='expression' style={{direction: "left"}}>{answer}</p>
              <p className='result'> {finalResult}</p>
            </div>
          </div>
        </div>

        <div className='container btn-container'>
          <div>
            <button id='C' style={{ width: "110px" }} onClick={() => clear()}>C</button>
            <button id='÷' onClick={() => deleteItem()}>←</button>
            <button id='÷' onClick={() => display('/')}>÷</button>
          </div>
          <div>
            <button id='9' onClick={() => display(7)}>7</button>
            <button id='8' onClick={() => display(8)}>8</button>
            <button id='7' onClick={() => display(9)}>9</button>
            <button id='x' onClick={() => display('*')}>x</button>
          </div>

          <div>
            <button id='4' onClick={() => display(4)}>4</button>
            <button id='5' onClick={() => display(5)}>5</button>
            <button id='6' onClick={() => display(6)}>6</button>
            <button id='-' onClick={() => display('-')}>-</button>
          </div>

          <div>
            <button id='1' onClick={() => display(1)}>1</button>
            <button id='2' onClick={() => display(2)}>2</button>
            <button id='3' onClick={() => display(3)}>3</button>
            <button id='+' onClick={() => display('+')}>+</button>
          </div>

          <div>
            <button id='.' onClick={() => display('.')}>.</button>
            <button id='0' onClick={() => display(0)}>0</button>
            <button id='=' onClick={() => dispTotal('=')} style={{ width: "110px" }}>=</button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
