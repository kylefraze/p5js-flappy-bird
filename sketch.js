// Game Objects
let birds = [];
let pipes = [];

// Mating Pool
let populationSize = 200;
let generation = 1;

// Enviroment Controls
let timeSlider;
let simFrameCount = 0;

let difficultySlider;

let showOneCheckbox;

function setup() {
  createCanvas(640, 240);
  ml5.tf.setBackend("cpu");
  for (let i = 0; i < 200; i++) {
    birds[i] = new Bird();
  }
  pipes.push(new Pipe());

  timeSlider = createSlider(1, 25, 1);
  timeSlider.position(10, 10); // Bottom right

  difficultySlider = createSlider(0.3, 1, 1, 0.1);
  difficultySlider.position(150, 10); // Bottom right

  // Save/Load buttons
  let saveButton = createButton("save");
  saveButton.position(0, height);
  saveButton.mousePressed(saveBird);

  //   let loadButton = createButton('load');
  //   loadButton.position(saveButton.width + 2, height);
  //   loadButton.mousePressed(loadBird);

  loadButton = createFileInput(loadBrain, false);
  loadButton.position(saveButton.width + 2, height);

  showOneCheckbox = createCheckbox("Show Mode");
  showOneCheckbox.position(10, height + 25);
}

function loadBrain(file) {
  console.log(file);
  newBrain = ml5.neuralNetwork({
    inputs: 4,
    outputs: ["flap", "no flap"],
    task: "classification",
    neuroEvolution: true,
  });
  newBrain.load(file.name);
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
  // We draw a white background ONCE each real frame
  background(255);

  // We do multiple simulation steps per real frame
  for (let n = 0; n < timeSlider.value(); n++) {
    simFrameCount++;

    // 1. Update existing pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
      // pipes[i].velocity = 2 * timeSlider.value();
      pipes[i].update();
      if (pipes[i].offscreen()) {
        pipes.splice(i, 1);
      }
    }

    // 2. Update birds
    for (let bird of birds) {
      if (bird.alive) {
        // Check collisions
        for (let pipe of pipes) {
          if (pipe.collides(bird)) {
            bird.alive = false;
          }
        }
        bird.think(pipes);
        bird.update();
      }
    }

    // 3. Spawn pipes based on *simulation* time
    //    i.e., every "X" simulation-frames, not real frames
    let spawnInterval = Math.floor(100 * difficultySlider.value());
    if (spawnInterval < 1) spawnInterval = 1;
    if (simFrameCount % spawnInterval === 0) {
      pipes.push(new Pipe());
    }

    // 4. If all birds are dead, do your generation logic
    if (allBirdsDead()) {
      normalizeFitness();
      reproduction();
      resetPipes();
      generation++;
      // Reset simFrameCount if you like, or keep counting continuously
    }
  }

  // Now that the "final" simulation state for this real frame is set,
  // actually *render* pipes and birds once
  for (let pipe of pipes) {
    pipe.show();
  }
  for (let bird of birds) {
    if (bird.alive) {
      bird.show();
      if (showOneCheckbox.checked()) {
        break;
      }
    }
  }

  // Draw your text info
  const aliveCount = birds.filter((bird) => bird.alive).length;
  const fittestBird = birds.reduce(
    (max, bird) => (bird.fitness > max.fitness ? bird : max),
    birds[0]
  );
  textAlign(LEFT);
  if (!showOneCheckbox.checked()) {
    text("Number of Birds Alive: " + aliveCount, 10, 50);
    text("Current Generation: " + generation, 10, 70);
    text("Best Bird Lifespan: " + fittestBird.fitness, 10, 90);
  }
}

function saveBird() {
  const fittestBird = birds.reduce(
    (max, bird) => (bird.fitness > max.fitness ? bird : max),
    birds[0]
  );
  fittestBird.brain.save("BirdBrain_" + generation + "_" + fittestBird.fitness);
}

function resetPipes() {
  // Remove all the pipes but the very latest one.
  pipes.splice(0, pipes.length - 1);
}
