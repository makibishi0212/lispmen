type LispAtom = number | string
type LispPrimiteiveExpression = Array<LispAtom>
type LispExpression = Array<LispAtom | LispPrimiteiveExpression>

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

        if(tmpString[0] === '(') {
            parseArray.push(this.parse(tmpString));
        }else {
            parseArray.push(this.parseAtom(tmpString));
        }

        //console.log(parseArray);

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

        const result = this.eval(exesource);
        console.log(result);
        return result;
    }

    private eval(expression):any {
        const func = expression.shift();
        const args:LispExpression = expression;

        const newargs: LispPrimiteiveExpression = [];

        args.forEach((element) => {
            if(Array.isArray(element)){
                let isPrimitive = true;
                element.forEach((elementelement) => {
                    if(Array.isArray(elementelement)) {
                        isPrimitive = false;
                    }
                })

                if(isPrimitive) {
                    newargs.push(this.evalPrimitive(element))
                }else {
                    newargs.push(this.eval(element))
                }
            }else {
                newargs.push(element);
            };
        });

        return this.funcList[func](...newargs)
    }

    private evalPrimitive(expression) {
        const func = expression.shift();
        const args:LispExpression = expression;
        return this.funcList[func](...args);
    }
}
