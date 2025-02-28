class Pipe {
  constructor() {
    // The size of the opening between the two parts of the pipe
    this.spacing = 100;
    // A random height for the top of the pipe
    this.top = random(height - this.spacing);
    // The starting position of the bottom pipe (based on the top)
    this.bottom = this.top + this.spacing;
    // The pipe starts at the edge of the canvas.
    this.x = width;
    // The width of the pipe
    this.w = 20;
    // The horizontal speed of the pipe
    this.velocity = 2;
  }

  collides(bird) {
    if (this.birdCollided) return;
    // Is the bird within the vertical range of the top or bottom pipe?
    let verticalCollision = bird.y < this.top || bird.y > this.bottom;
    // Is the bird within the horizontal range of the pipes?
    let horizontalCollision = bird.x > this.x && bird.x < this.x + this.w;
    //{!1} If it’s both a vertical and horizontal hit, it’s a hit!
    return verticalCollision && horizontalCollision;
  }

  offscreen() {
    return this.x < -this.w;
  }

  // Draw the two pipes.
  show() {
    fill(0);
    noStroke();
    rect(this.x, 0, this.w, this.top);
    rect(this.x, this.bottom, this.w, height - this.bottom);
  }

  // Update the horizontal position.
  update() {
    this.x -= this.velocity;
  }
}
