type LispAtom = number | string
type LispPrimiteiveExpression = Array<LispAtom>
type LispExpression = Array<LispAtom | LispPrimiteiveExpression>

export class Lisp {
    private funcList:{[funcName: string]: Function} = {};

    private source:Array<any> = null;

    constructor(source:Array<any>) {
        this.source = source;

        this.funcList["+"] = (...args) => {
            let sum = 0;
            args.forEach((num: number) => {
                sum += num;
            })
            return sum;
        }

        console.log(this.funcList);
    }

    public execute() {
        let source:LispExpression = JSON.parse(JSON.stringify(this.source));

        console.log(this.eval(source));
    }

    private eval(expression) {
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
