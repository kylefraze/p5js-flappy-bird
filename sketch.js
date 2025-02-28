// Game Objects
let birds = [];
let pipes = [];

// Mating Pool
let populationSize = 200;
let generation = 1;

// Generation Speed Control
let timeSlider;

function setup() {
  createCanvas(640, 240);
  ml5.tf.setBackend("cpu");
  for (let i = 0; i < 200; i++) {
    birds[i] = new Bird();
  }
  pipes.push(new Pipe());

  timeSlider = createSlider(1, 8, 1);
  timeSlider.position(10, 10); // Bottom right
  
  // Save/Load buttons
  let saveButton = createButton('save');
  saveButton.position(0, height);
  saveButton.mousePressed(saveBird);
  
//   let loadButton = createButton('load');
//   loadButton.position(saveButton.width + 2, height);
//   loadButton.mousePressed(loadBird);
  
  loadButton = createFileInput(loadBrain, false);
  loadButton.position(saveButton.width + 2, height);

}

function loadBrain(file) {
  console.log(file)
  newBrain = ml5.neuralNetwork({
        inputs: 4,
        outputs: ["flap", "no flap"],
        task: "classification",
        neuroEvolution: true,
      });
  newBrain.load(file.name)
  newBird = birds.push(new Bird(newBrain));
}

function allBirdsDead() {
  for (let bird of birds) {
    //{!3} If a single bird is alive, they are not all dead!
    if (bird.alive) {
      return false;
    }
  }
  //{!1} If the loop completes without finding a living bird, all the birds are dead.
  return true;
}

//{!1} See Chapter 9 for a detailed explanation of this algorithm.
function weightedSelection() {
  let index = 0;
  let start = random(1);
  while (start > 0) {
    start = start - birds[index].fitness;
    index++;
  }
  index--;
  //{!1} Instead of returning the entire Bird object, just the brain is returned.
  return birds[index].brain;
}

function normalizeFitness() {
  // Sum the total fitness of all birds.
  let sum = 0;
  for (let bird of birds) {
    sum += bird.fitness;
  }
  //{!3} Divide each bird’s fitness by the sum.
  for (let bird of birds) {
    bird.fitness = bird.fitness / sum;
  }
}

function reproduction() {
  //{!1} Start with a new empty array.
  let nextBirds = [];
  for (let i = 0; i < populationSize; i++) {
    // Pick two parents.
    let parentA = weightedSelection();
    let parentB = weightedSelection();
    // Create a child with crossover.
    let child = parentA.crossover(parentB);
    // Apply mutation.
    child.mutate(0.01);
    //{!1} Create the new bird object.
    nextBirds[i] = new Bird(child);
  }
  //{!1} The next generation is now the current one!
  birds = nextBirds;
}

//{!3} The bird flaps its wings when the mouse is clicked.
// function mousePressed() {
//   bird.flap();
// }

function draw() {
  background(255);
  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].velocity = 2 * timeSlider.value();
    pipes[i].update();
    pipes[i].show();
    if (pipes[i].offscreen()) {
      pipes.splice(i, 1);
    }
  }

  for (let bird of birds) {
    if (bird.alive) {
      for (let pipe of pipes) {
        if (pipe.collides(bird)) {
          bird.alive = false;
        }
      }
      for (let i = 0; i < timeSlider.value(); i++) {
        bird.think(pipes);
        bird.update();
      }
      bird.show();
    }
  }

  if (frameCount % (100/timeSlider.value()) == 0) {
    pipes.push(new Pipe());
  }

  if (allBirdsDead()) {
    normalizeFitness();
    reproduction();
    resetPipes();
    generation++
  }
  
  // Simulation Information Display
  const aliveCount = birds.filter(bird => bird.alive).length;
  // Get the bird with the highest fitness
const fittestBird = birds.reduce((max, bird) => (bird.fitness > max.fitness ? bird : max), birds[0]);
  textAlign(LEFT)
  text("Number of Birds Alive: " +  aliveCount, 10, 50)
  text("Current Generation: " +  generation, 10, 70)
  text("Best Bird Lifespan: " +  fittestBird.fitness, 10, 90)
}

function saveBird() {
  const fittestBird = birds.reduce((max, bird) => (bird.fitness > max.fitness ? bird : max), birds[0]);
  fittestBird.brain.save("BirdBrain_"+generation+"_"+fittestBird.fitness)
}

function resetPipes() {
  // Remove all the pipes but the very latest one.
  pipes.splice(0, pipes.length - 1);
}
