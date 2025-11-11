import { useState } from 'react';

// =================================================================
// 1. COMPONENTA SQUARE (PĂTRAT)
// Adaugă prop-ul `isWinning` pentru evidențiere și `data-value` pentru animație.
// =================================================================
function Square({ value, onSquareClick, isWinning }) {
    // Aplică clasa 'winning-square' dacă isWinning este true
    const className = `square ${isWinning ? 'winning-square' : ''}`;

    return (
        <button
            className={className}
            onClick={onSquareClick}
            // data-value este folosit de CSS pentru a aplica culoarea și animația X/O
            data-value={value}
        >
            {value}
        </button>
    );
}

// =================================================================
// 2. COMPONENTA BOARD (TABLĂ DE JOC)
// Extrage linia câștigătoare și pasează starea câștigătoare fiecărui Square.
// =================================================================
function Board({ xIsNext, squares, onPlay }) {
    // Funcție ajutătoare pentru a gestiona click-ul
    function handleClick(i) {
        // Nu permite mutări dacă jocul s-a terminat sau pătratul este ocupat
        if (calculateWinner(squares).winner || squares[i]) {
            return;
        }

        const nextSquares = squares.slice();
        nextSquares[i] = xIsNext ? 'X' : 'O';

        onPlay(nextSquares);
    }

    // Extrage câștigătorul și linia câștigătoare
    const { winner, line } = calculateWinner(squares);

    let status;
    if (winner) {
        status = 'Câștigător: ' + winner + '!';
    } else if (squares.every(s => s !== null)) {
        status = 'Egalitate!';
    } else {
        status = 'Urmează: ' + (xIsNext ? 'X' : 'O');
    }

    // Funcție pentru a genera tabla de joc dinamic (în loc să o scriem de mână)
    const renderBoard = () => {
        const board = [];
        for (let i = 0; i < 3; i++) {
            const row = [];
            for (let j = 0; j < 3; j++) {
                const index = i * 3 + j;
                row.push(
                    <Square
                        key={index}
                        value={squares[index]}
                        onSquareClick={() => handleClick(index)}
                        // Verifica daca indexul curent este inclus in linia castigatoare
                        isWinning={line.includes(index)}
                    />
                );
            }
            board.push(<div key={i} className="board-row">{row}</div>);
        }
        return board;
    };

    return (
        <>
            <div className="status">{status}</div>
            {renderBoard()}
        </>
    );
}

// =================================================================
// 3. COMPONENTA GAME (JOCUL PRINCIPAL)
// Rămâne neschimbată, gestionează starea istorică.
// =================================================================
export default function Game() {
    const [history, setHistory] = useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];

    function handlePlay(nextSquares) {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
    }

    const moves = history.map((squares, move) => {
        let description;
        if (move === currentMove) {
            // Cazul în care ne aflăm la mutarea curentă
            description = 'Ești la mutarea #' + move;
            return (
                <li key={move} style={{ fontWeight: 'bold', color: '#BB86FC' }}>
                    {description}
                </li>
            );
        } else if (move > 0) {
            description = 'Mergi la mutarea #' + move;
        } else {
            description = 'Mergi la începutul jocului';
        }

        return (
            <li key={move}>
                <button onClick={() => jumpTo(move)}>{description}</button>
            </li>
        );
    });

    return (
        <div className="game">
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
            </div>
            <div className="game-info">
                <h2>Istoric Mutații</h2>
                <ol>{moves}</ol>
            </div>
        </div>
    );
}

// =================================================================
// 4. FUNCȚIA CALCULATE WINNER (LOGICĂ)
// Acum returnează și linia câștigătoare.
// =================================================================
function calculateWinner(squares) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            // Returneaza un obiect cu castigatorul SI linia
            return { winner: squares[a], line: lines[i] };
        }
    }
    // Daca nu exista castigator, returneaza null si o linie goala
    return { winner: null, line: [] };
}