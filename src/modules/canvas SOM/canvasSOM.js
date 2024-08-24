// VERSION: 0.3.1
// CHANGELOG: commented out line 441 (sqrt in calculating distances, because were only comparing, the squares are enough and faster) TODO: TEST
// CHANGELOG (old): start of adding trad. algorithm for ajusting weights


const NEURON_CLASSLESS = "##noclass##"
const NETWORK_FILE_VERSION = 1


export class Neuron {
    // Neuron class *based* on https://github.com/mljs/som/blob/master/src/node-square.js
    constructor(x, y, weights, som) {
        this.x = x;
        this.y = y;
        this.weights = weights;
        this.som = som;
        this.neighbours = []; // [distanceToIt, neighbourNeuron]
        this.won = false
        this.color = "#FFFFFF"
        this.classValue = undefined
    }

    drawSelf(color=undefined) {
        color === undefined ? "" : this.color = color
        this.som.drawPixel(this.x, this.y, this.color)
    }

    drawBit(color, outlineColor) {
        this.som.drawBit(this.x, this.y, color, outlineColor)
    }

    adjustWeights(obj, distanceFromWinning, ils, nEpochs, currentEpoch) {
        // obj = [weight 1, weight 2, etc..]
        // ils = inicial learning span (user defined)
        let newWeights = []
        // const dL = ils - currentEpoch * ils / nEpochs
        const dL = (ils - (currentEpoch * ils) / nEpochs)
        for (let i = 0; i < this.weights.length; i++) {
            // const newWeight = this.weights[i] + (obj[i] - this.weights[i]) * (0.4995 * (nEpochs - currentEpoch) / (nEpochs - 1) + 0.0005) * (1 - distanceFromWinning / dL + 1)
            // const newWeight = this.weights[i] + ((obj[i] - this.weights[i]) * (0.4995 * ((nEpochs - currentEpoch) / (nEpochs - 1)) + 0.0005) * (1 - (distanceFromWinning / (dL + 1))))
            const newWeight = this.weights[i] + (obj[i] - this.weights[i]) * (0.4995 * (nEpochs - currentEpoch) / (nEpochs - 1) + 0.0005) * (1 - distanceFromWinning / (dL + 1))
            //    winew     = wiold           + (obji   - wiold          ) . (0.4995 * (epochmax- epoch       ) / (epochmax- 1) + 0.0005) . (1 - d                   / (dL + 1))
            newWeights.push(newWeight)
        }
        this.weights = newWeights
        // const dL = (ils - (currentEpoch * ils) / nEpochs)
        // for (let i = 0; i < this.weights.length; i++) {
        //     this.weights[i] += ((obj[i] - this.weights[i]) * (0.4995 * ((nEpochs - currentEpoch) / (nEpochs - 1)) + 0.0005) * (1 - (distanceFromWinning / (dL + 1))))
        // }
    }

    adjustWeightsTrad(obj, distanceFromWinning, dL, nEpochs, currentEpoch) {
        // obj = [weight 1, weight 2, etc..]
        // ils = inicial learning span (user defined)
        let newWeights = []
        
        for (let i = 0; i < this.weights.length; i++) {
            const newWeight = this.weights[i] + (obj[i] - this.weights[i]) * (0.4995 * (nEpochs - currentEpoch) / (nEpochs - 1) + 0.0005) * (1 - distanceFromWinning / (dL + 1))
            newWeights.push(newWeight)
        }
        this.weights = newWeights
    }

    getDistanceTorus(otherNeuron) {
        let distX = Math.abs(this.x - otherNeuron.x),
            distY = Math.abs(this.y - otherNeuron.y);
        return Math.max(
            Math.min(distX, this.som.size - distX), 
            Math.min(distY, this.som.size - distY)
        );
    }

    winner(obj, ils, nEpochs, currentEpoch, tradAlgo=false) {
        if (tradAlgo) {
            const dL = Math.round(ils - (currentEpoch * ils) / nEpochs)
            // ajusts its own weights
            this.adjustWeightsTrad(obj, 0, dL, nEpochs, currentEpoch)
            // adjusts weights of all other neurons accordingly
            for (const neighbour of this.neighbours) {
                let distanceFromWinning = neighbour[0]
                if (distanceFromWinning <= dL) {
                    neighbour[1].adjustWeightsTrad(obj, distanceFromWinning, dL, nEpochs, currentEpoch)
                }
            }
        } else {
            // ajusts its own weights
            this.adjustWeights(obj, 0, ils, nEpochs, currentEpoch)
            // adjusts weights of all other neurons accordingly
            for (const neighbour of this.neighbours) {
                neighbour[1].adjustWeights(obj, neighbour[0], ils, nEpochs, currentEpoch)
            }
        }
    }

    getNeighbours(maxDist) {
        // stores neighbour neurons and distances for optimization puroses
        // (they then don't need to be calculated again)
        for (const neuron of this.som.neurons) {
            const dist = this.getDistanceTorus(neuron)
            if ((dist !== 0) && (dist <= maxDist)) {
                this.neighbours.push([dist, neuron])
            }
        }
    }
}


export class SOM {
    constructor(size, colorsList=undefined) {
        // With standard colorsList class number is maxed at 14
        // NOTE: colors black and white are reserved for special events
        this.size = size // square

        const canvas = document.querySelector(".som")
        this.pixelConstant = Math.floor(canvas.height / this.size)
        this.canvasSize = this.pixelConstant * this.size
        canvas.height = this.canvasSize
        canvas.width = this.canvasSize
        this.ctx = canvas.getContext("2d")

        this.neurons = []
        if (colorsList === undefined) {
            this.colorsList = [
                "maroon",
                "red",
                "purple",
                "fuchsia",
                "green",
                "lime",
                "olive",
                "gold",
                "navy",
                "blue",
                "teal",
                "aqua",
                "orange",
                "goldenrod",
            ]
        } else {
            this.colorsList = colorsList
        }

        this.mean = []
        this.sd = []
        this.painted = false
        this.ils = 0  // needed for the pre-calculation of neighbours for neurons from a loaded network

        // values to later seed a random number generator function
        this.randomValues = [
            parseInt(Math.random() * 10000000000) ^ 0x9E3779B9,
            parseInt(Math.random() * 10000000000) ^ 0x243F6A88,
            parseInt(Math.random() * 10000000000) ^ 0xB7E15162,
            parseInt(Math.random() * 10000000000) ^ 0xDEADBEEF
        ]
    }

    showGrid(color="black") {
        this.ctx.lineWidth = 2
        this.ctx.strokeStyle = color
        this.ctx.beginPath()
        this.ctx.moveTo(0, 0)
        this.ctx.lineTo(this.canvasSize, 0)
        this.ctx.lineTo(this.canvasSize, this.canvasSize)
        this.ctx.lineTo(0, this.canvasSize)
        this.ctx.lineTo(0, 0)

        for (let i = 0; i < this.canvasSize; i += this.pixelConstant) {
            this.ctx.moveTo(0, i)
            this.ctx.lineTo(this.canvasSize, i)
        }
        for (let i = 0; i < this.canvasSize; i += this.pixelConstant) {
            this.ctx.moveTo(i, 0)
            this.ctx.lineTo(i, this.canvasSize)
        }
        this.ctx.stroke()
    }

    drawPixel(x, y, color) {
        this.ctx.fillStyle = color
        this.ctx.fillRect(x*this.pixelConstant, y*this.pixelConstant, this.pixelConstant, this.pixelConstant)
    }

    drawBit(x, y, color, outlineColor) {
        const randomNumber = (min, max) => {return Math.random() * (max - min) + min;}
        let size = this.pixelConstant / 3
        const posX = randomNumber(x*this.pixelConstant, x*this.pixelConstant + size*2)
        const posY = randomNumber(y*this.pixelConstant, y*this.pixelConstant + size*2)

        this.ctx.fillStyle = color
        this.ctx.fillRect(
            posX,
            posY,
            size,
            size
        )
        
        this.ctx.lineWidth = 1
        this.ctx.strokeStyle = outlineColor
        this.ctx.beginPath()
        this.ctx.moveTo(posX, posY)
        this.ctx.lineTo(posX, posY + size)
        this.ctx.lineTo(posX + size, posY + size)
        this.ctx.lineTo(posX + size, posY)
        this.ctx.lineTo(posX, posY)
        this.ctx.stroke()
    }

    static sfc32 = (a, b, c, d) => {
        // from StackOverflow "https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript"
        // generates a random number generator function from a seed (or 4 of them I guess)
        return function() {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
        var t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
        }
    }

    static shuffle(array, randomFunc) {
        // from StackOverflow "https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array"
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
      
          // Pick a remaining element.
          randomIndex = Math.floor(randomFunc() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
    }

    drawMap(descriptors, classValues, constantColors, showGrid=false, gridColor=undefined) {
        if (!constantColors) {
            const rand = SOM.sfc32(this.randomValues[0],this.randomValues[1],this.randomValues[2],this.randomValues[3])
            for (var i = 0; i < 15; i++) rand();
            SOM.shuffle(this.colorsList, rand)
        }
        const count = (arr, obj) => {
            let counter = 0;
            for (const item of arr) {
                if (item === obj) {
                    counter++;
                }
            }
            return counter;
        }
        const removeDuplicates = (arr) => {return [...new Set(arr)];}

        let winnerDict = {}
        for (let i = 0; i < this.neurons.length; i++) {
            winnerDict[i] = []
        }

        for (let i = 0; i < descriptors.length; i++) {
            const descArray = descriptors[i];
            const classValue = classValues[i];
            
            // run and mark network using class values
            const winner = this.testThroughNetwork(descArray)
            const winnerIndex = this.neurons.indexOf(winner)
            winnerDict[winnerIndex].push(classValue)
            // winner.color = this.colorsList[this.uniqueClasses.indexOf(classValue)]
            // winner.classValue = classValue
        }


        for (let i = 0; i < this.neurons.length; i++) {
            const classValues = winnerDict[i]
            if (classValues.length === 0) {continue;}
            const neuron = this.neurons[i]

            const uniqueCVs = removeDuplicates(classValues)

            let chosenValue, maxCount = 0, draw = false
            for (const value of uniqueCVs) {
                let c = count(classValues, value)
                if (c > maxCount) {
                    maxCount = c
                    chosenValue = value
                    draw = false
                } else if (c === maxCount) {
                    draw = true
                }
            }

            if (!draw) {
                neuron.color = this.colorsList[this.uniqueClasses.indexOf(chosenValue)]
                neuron.classValue = chosenValue
            } else {
                neuron.color = "#000000"
                neuron.classValue = NEURON_CLASSLESS
            }
        }

        for (const neuron of this.neurons) {
            neuron.drawSelf()
        }
        if (showGrid) {gridColor === undefined ? this.showGrid() : this.showGrid(gridColor)}

        const colorDict = {}
        for (let i = 0; i < this.uniqueClasses.length; i++) {
            const classValue = this.uniqueClasses[i];
            const colorValue = this.colorsList[i];

            colorDict[classValue] = colorValue
        }
        return colorDict
    }

    static normalize(arr) {
        // z normalization
        let sum = 0
        for (const num of arr) {
            sum += num
        }
        // mean value = average
        const mean = sum / arr.length
        let sum2 = 0
        for (const num of arr) {
            sum2 += (num - mean)**2
        }
        // standard deviation = sqrt(variance)
        const sd = Math.sqrt(sum2 / arr.length)

        // normalize
        let arr2 = arr.map((value) => {
            return ((value - mean) / sd)
        })

        return [arr2, mean, sd]
    }

    transformData(rawData, testData=false, sep="\t") {
        const lines = rawData.split("\n")
        
        let descriptors = []
        let classValues = []
        
        for (let line of lines) {
            const split = line.split(sep)
            const descs = split.slice(0, -1)
            const value = split.at(-1).replaceAll("\r","")

            descriptors.push(descs.map((value) => {
                return parseFloat(value)
            }))
            classValues.push(value)
        }

        // transposing the 2 dimensional array descriptors cause you need
        // columns for normalization of data
        // Standard deviation no longer needed because by z-normalizing everything
        // the s.d. is always 1 and the mean value is always 0
        let columns = []
        for (let i = 0; i < descriptors[0].length; i++) {
            let col = []
            descriptors.forEach((value) => {
                col.push(value.at(i))
            })

            let normalizedCol, mean, sd;
            if (!testData) {
                [normalizedCol, mean, sd] = SOM.normalize(col)
                this.mean.push(mean)
                this.sd.push(sd)
            } else {
                normalizedCol = col.map((value) => {
                    // null data (NA, Null, etc..) is handeled automatically here
                    if (value === NaN) {
                        return 0
                    } else {
                        // values are normalized with the corresponding mean value
                        // and standard deviation of the training set for that descriptor 
                        return ((value - this.mean[i]) / this.sd[i])
                    }
                })
            }
            columns.push(normalizedCol)
        }

        // transposing again back to how it was originally
        let rows = []
        for (let i = 0; i < columns[0].length; i++) {
            let row = []
            columns.forEach((value) => {
                row.push(value.at(i))
            })
            rows.push(row)
        }

        // descriptors for each compound in each row [index i]
        // class values for each compound in the same index [i] of a separate array
        return [rows, classValues]
    }

    static generateRandomWeights(dLenght) {
        let weights = []
        for (let i = 0; i < dLenght; i++) {
            // const sd = sds[i]
            // const range = (sd * 2)
            // const weight = (Math.random() * range) - sd
            const weight = (Math.random() * 2) - 1
            weights.push(weight)
        }
        return weights
    }

    createMap(dLenght) {
        for (let i = 0; i < this.size; i++) {
            for (let i2 = 0; i2 < this.size; i2++) {
                this.neurons.push(
                    new Neuron(i, i2, SOM.generateRandomWeights(dLenght), this)
                )
            }
        }
        
    }

    testThroughNetwork(descArray) {
        let winner, smallerDist = undefined;
        for (const neuron of this.neurons) {
            let distance = 0

            for (let i = 0; i < neuron.weights.length; i++) {
                const weight = neuron.weights[i];
                const descriptor = descArray[i];
                distance += (weight - descriptor)**2
            }
            // TODO TEST NOT NEEDED SQRT FOR COMPARISON ONLY
            // let dist = Math.sqrt(distance)

            if ((smallerDist === undefined) || (distance < smallerDist)) {
                winner = neuron
                smallerDist = distance
            }
        }
        return winner
    }

    runThroughNetwork(descArray, ils, nEpochs, currentEpoch, tradAlgo=false) {
        let winner = this.testThroughNetwork(descArray)
        winner.winner(descArray, ils, nEpochs, currentEpoch, tradAlgo)
    }

    async train(rawData, ils=7, nEpochs=300, tradAlgo=false, constantColors=false) {
        const [descriptors, classValues] = this.transformData(rawData, false)
        this.ils = ils

        // an ordered list of all possible class values (needed for other functions)
        const removeDuplicates = (arr) => {return [...new Set(arr)];}
        this.uniqueClasses = removeDuplicates(classValues)

        this.createMap(descriptors[0].length)

        // shuffle both lists with the same seed because they depend on one another
        const rand1 = SOM.sfc32(this.randomValues[0],this.randomValues[1],this.randomValues[2],this.randomValues[3])
        const rand2 = SOM.sfc32(this.randomValues[0],this.randomValues[1],this.randomValues[2],this.randomValues[3])
        for (var i = 0; i < 15; i++) rand1();
        for (var i = 0; i < 15; i++) rand2();
        SOM.shuffle(descriptors, rand1)
        SOM.shuffle(classValues, rand2)

        for (const neuron of this.neurons) {
            if (tradAlgo) {
                neuron.getNeighbours(ils)
            } else {
                neuron.getNeighbours(2)
            }
        }

        async function sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }
        const epochsElm = document.querySelector("#nEpochs")  // has to exist (span#nEpochs)
        for (let epoch = 1; epoch < (nEpochs + 1); epoch++) {
            // console.log('> Epoch: ', epoch);
            epochsElm.textContent = epoch
            // sleep needed to uptade the DOM
            await sleep(.0001)
            
            for (const descArray of descriptors) {
                this.runThroughNetwork(descArray, ils, nEpochs, epoch, tradAlgo)
            }
        }
        this.colorDict = this.drawMap(descriptors, classValues, constantColors)
        return this.colorDict  // colorDict = {"<classValue>": "<color>"}
    }

    test(rawData, outlineColor="white") {
        this.inferColors()
        const [descriptors, classValues] = this.transformData(rawData, true)

        if (this.uniqueClasses === undefined) {
            // this block only runs in case a previously trained network is loaded (it doesn't store this attribute)
            let removeDuplicates = (arr) => {return [...new Set(arr)];}
            this.uniqueClasses = removeDuplicates(classValues)
        }

        // shuffle both lists with the same seed because they depend on one another
        const rand1 = SOM.sfc32(this.randomValues[0],this.randomValues[1],this.randomValues[2],this.randomValues[3])
        const rand2 = SOM.sfc32(this.randomValues[0],this.randomValues[1],this.randomValues[2],this.randomValues[3])
        for (var i = 0; i < 15; i++) rand1();
        for (var i = 0; i < 15; i++) rand2();
        SOM.shuffle(descriptors, rand1)
        SOM.shuffle(classValues, rand2)

        let rightCount = 0
        for (let i = 0; i < descriptors.length; i++) {
            const descArray = descriptors[i];
            const classValue = classValues[i];
            
            // run and mark network using class values and check if it predicted correctly
            const winner = this.testThroughNetwork(descArray)
            winner.drawBit(this.colorsList[this.uniqueClasses.indexOf(classValue)], outlineColor)

            if (winner.classValue === classValue) {rightCount++}
        }

        const accuracy = Math.round((rightCount/descriptors.length)*10000)/100
        console.log(`> Accuracy of Model: ${accuracy}% , ${rightCount}, ${descriptors.length}`);
        return accuracy
    }

    inferColors() {
        if (this.painted) {return null}
        // fills uncolored (white) neurons by infering the color (and class value) from neighbours *when possible*
        const removeDuplicates = (arr) => {return [...new Set(arr)];}
        const count = (arr, obj) => {
            let counter = 0;
            for (const item of arr) {
                if (item === obj) {
                    counter++;
                }
            }
            return counter;
        }

        let neuronMap = []
        for (const neuron of this.neurons) {
            if (neuron.classValue !== undefined) {
                continue;
            }

            let classValues = []
            let colorValues = []
            for (const neighbour of neuron.neighbours) {
                if (neighbour[0] !== 1) {
                    continue;
                }

                classValues.push(neighbour[1].classValue)
                colorValues.push(neighbour[1].color)
            }

            const uniqueCVs = removeDuplicates(classValues)
            let undefIndex = uniqueCVs.indexOf(undefined)
            if (undefIndex !== -1) {uniqueCVs.splice(undefIndex, 1)}

            let chosenValue, maxCount = 0, draw = false
            for (const value of uniqueCVs) {
                let c = count(classValues, value)
                if (c > maxCount) {
                    maxCount = c
                    chosenValue = value
                    draw = false
                } else if (c === maxCount) {
                    draw = true
                }
            }

            if (!draw) {
                neuronMap.push([neuron, chosenValue, colorValues[classValues.indexOf(chosenValue)]])
            }
        }
        for (const [neuron, classValue, color] of neuronMap) {
            neuron.classValue = classValue
            neuron.color = color
        }
        for (const neuron of this.neurons) {
            neuron.drawSelf()
        }
        this.painted = true
    }

    // save to file (string)    (file handling not included)
    toJson() {
        let neurons = []
        for (const neuron of this.neurons) {
            neurons.push({
                "x": neuron.x,
                "y": neuron.y,
                "weights": neuron.weights,
                "won": neuron.won,
                "color": neuron.color,
                "classValue": neuron.classValue,
            })
        }
        const toJson = {
            "version": NETWORK_FILE_VERSION,
            "size": this.size,
            "painted": this.painted,
            "neurons": neurons,
            "mean": this.mean,
            "sd": this.sd,
            "colorDict": this.colorDict,
            "colorsList": this.colorsList,
            "ils": this.ils,
        }
        return JSON.stringify(toJson)
    }

    // load from file (string)  (file handling not included)
    static fromJson(jsn) {
        const data = JSON.parse(jsn)
        if (data.version !== NETWORK_FILE_VERSION) {
            throw new VersionError("Network file outdated")
            // do you want to update manually? (see changelog)
            // changelog:
            // new version: 1
            // new ils: previously used initial learning span (probably 2)
        }
        const som = new SOM(data.size, data.colorsList)
        som.mean = data.mean
        som.sd = data.sd
        som.painted = data.painted
        som.colorDict = data.colorDict
        som.ils = data.ils
        
        let neurons = []
        for (const neur of data.neurons) {
            let neuron = new Neuron(neur.x, neur.y, neur.weights, som)
            neuron.won = neur.won
            neuron.color = neur.color
            neuron.classValue = neur.classValue
            neuron.drawSelf()
            neurons.push(neuron)
        }
        som.neurons = neurons
        for (const neuron of som.neurons) {
            neuron.getNeighbours(data.ils)
        }

        return som
    }

    __visualizeDistances(neuronIndex) {
        if (neuronIndex > this.neurons.length) {
            neuronIndex = this.neurons.length - 1
        }
        for (const neuronL of this.neurons[neuronIndex].neighbours) {
            neuronL[1].color = this.colorsList[neuronL[0]]
        }
        for (const neuron of this.neurons) {
            neuron.drawSelf()
        }
    }
}


export class VersionError extends Error {
    constructor(message) {
        super(message)
        this.name = "VersionError"
    }
}