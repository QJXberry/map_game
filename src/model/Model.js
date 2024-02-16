import { config_4x4, config_5x5, config_6x6 } from "../configs"

export class Square {
    constructor (r, c, color) {
        this.row = r
        this.column = c
        this.color = color
    }
}

export class Board {
    constructor (config) {
        this.squares = []
        this.size = parseInt(config.numColumns)
        
        for (let csq of config.baseSquares) {
            let sq = new Square(parseInt(csq.row), parseInt(csq.column), csq.color)
            this.squares.push(sq)
        }
    }
}

export default class Model {
    constructor(index) {
        this.configs = [ config_4x4, config_5x5, config_6x6 ] 
        this.currentConfig = index || 0;
        this.board = new Board(this.configs[this.currentConfig])
    }
}