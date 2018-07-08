type LispAtom = number | string | boolean
type LispPrimiteiveExpression = Array<LispAtom>
type LispExpression = Array<LispAtom | LispPrimiteiveExpression | LispError>

export class Lisp {
    private funcList:{[funcName: string]: Function} = {};

    constructor() {
        this.funcList["+"] = (...args) => {
            let sum = 0;
            args.forEach((num: number) => {
                sum += num;
            })
            return sum;
        }

        this.funcList["*"] = (...args) => {
            let product = 1;
            args.forEach((num: number) => {
                product *= num;
            })
            return product;
        }

        this.funcList["-"] = (arg1, arg2) => {
            return arg1 - arg2;
        }

        this.funcList["/"] = (arg1, arg2) => {
            return arg1 / arg2;
        }

        //console.log(this.funcList);
    }

    public parse(lispSourse:string):Array<LispExpression> {
        const sourceString = lispSourse.slice(lispSourse.indexOf('(') + 1, lispSourse.lastIndexOf(')'));

        const parseArray = [];

        let tmpString:string = '';
        let step:number = 0;
        for(let i=0;i<sourceString.length;i++) {
            switch (sourceString[i]) {
                case '(':
                    step++;
                    tmpString += sourceString[i];
                    break;
                case ')':
                    step--;
                    tmpString += sourceString[i];
                    break;
                case ' ':
                    if(step === 0) {
                        if(tmpString[0] === '(') {
                            parseArray.push(this.parse(tmpString));
                        }else {
                            parseArray.push(this.parseAtom(tmpString));
                        }
                        tmpString = '';
                    }else {
                        tmpString += sourceString[i];
                    }
                    break;
                default:
                    tmpString += sourceString[i];
                    break;
            }
        }

        if(step) {
            return null;
        }

        if(tmpString[0] === '(') {
            parseArray.push(this.parse(tmpString));
        }else {
            parseArray.push(this.parseAtom(tmpString));
        }

        console.log(parseArray);

        return parseArray;
    }

    private parseAtom(atomString: string) :string | number {
        if(!Number.isNaN(Number(atomString))) {
            return Number(atomString);
        }else {
            return atomString;
        }
    }

    public execute(source:Array<LispExpression>) {
        let exesource:LispExpression = JSON.parse(JSON.stringify(source));

        if(!source) {
            return 'Oh Parse Error';
        }

        const result = this.eval(exesource);
        if(result instanceof LispError) {
            return result.message;
        }
        return result;
    }

    private eval(expression):any {
        const func = expression.shift();
        const args:LispExpression = expression;

        const newargs: LispPrimiteiveExpression = [];
        let error = null;

        const errorOccured = args.some((element) => {
            if(Array.isArray(element)){
                let isPrimitive = true;
                element.forEach((elementelement) => {
                    if(Array.isArray(elementelement)) {
                        isPrimitive = false;
                    }
                })

                if(isPrimitive) {
                    const result = this.evalPrimitive(element);
                    if(result instanceof LispError) {
                        error = result;
                        return true;
                    }else {
                        newargs.push(result);
                    }
                }else {
                    const result = this.eval(element);
                    if(result instanceof LispError) {
                        error = result;
                        return true;
                    }else {
                        newargs.push(result);
                    }
                }
            }else if(element instanceof LispError) {
                return true
            }else {
                newargs.push(element);
            };
        });

        if(errorOccured) {
            return error;
        }

        if(this.funcList[func]) {
            return this.funcList[func](...newargs)
        }else {
            console.error('function ' + func + 'is undefined.');
            return new LispError('function ' + func + ' is undefined.');
        }
    }

    private evalPrimitive(expression) {
        const func = expression.shift();
        const args:LispExpression = expression;
        if(this.funcList[func]) {
            return this.funcList[func](...args);
        }else {
            console.error('function ' + func + ' is undefined.');
            return new LispError('function ' + func + ' is undefined.');
        }
    }
}

class LispError {
    public message = '';
    constructor(message: string) {
        this.message = 'ERROR:' + message;
    }
}
