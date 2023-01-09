const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/background1.png",
});

const mushroom = new Sprite({
  position: {
    x: 660,
    y: 408,
  },
  imageSrc: "./img/mushroomidle.png",
  scale: 1.4,
  framesMax: 9,
});

const player = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/samurai1/Idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 195,
    y: 160,
  },
  sprites: {
    idle: {
      imageSrc: "./img/samurai1/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./img/samurai1/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/samurai1/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/samurai1/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/samurai1/Attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./img/samurai1/Take Hit - white silhouette.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./img/samurai1/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50,
    },
    width: 160,
    height: 50,
  },
});

const enemy = new Fighter({
  position: {
    x: 400,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  color: "blue",
  offset: {
    x: -50,
    y: 0,
  },
  imageSrc: "./img/HeroBlade/Idle.png",
  framesMax: 11,
  scale: 2.5,
  offset: {
    // x: -295,
    // y: 132,
    x: 215,
    y: 132,
  },
  sprites: {
    idle: {
      imageSrc: "./img/HeroBlade/Idle.png",
      framesMax: 11,
    },
    run: {
      imageSrc: "./img/HeroBlade/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/HeroBlade/Jump.png",
      framesMax: 3,
    },
    fall: {
      imageSrc: "./img/HeroBlade/Fall.png",
      framesMax: 3,
    },
    attack1: {
      imageSrc: "./img/HeroBlade/Attack2.png",
      framesMax: 7,
    },
    takeHit: {
      imageSrc: "./img/HeroBlade/Take Hit.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./img/HeroBlade/Death.png",
      framesMax: 11,
    },
  },
  attackBox: {
    offset: {
      x: -200,
      y: 50,
    },
    width: 160,
    height: 50,
  },
});

enemy.draw();

console.log(player);

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  // w: {
  //   pressed: false,
  // },
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
};

decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  mushroom.update();
  c.fillStyle = ' rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // player movement

  if (keys.a.pressed && player.lastKey === "a" && player.position.x > -40) {
    player.velocity.x = -5;
    player.switchSprite("run");
  } else if (keys.d.pressed && player.lastKey === "d" && player.position.x < canvas.width - 80) {
    player.velocity.x = 5;
    player.switchSprite("run");
  } else {
    player.switchSprite("idle");
  }

  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }

  // enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft" && enemy.position.x > 10) {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight" && enemy.position.x < canvas.width) {
    enemy.velocity.x = 5;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }
  // jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  // // detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;

    gsap.to('#enemyHealth', {
      width: enemy.health + "%"
    })
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  // this is where our player gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 4
  ) {
    player.takeHit();
    enemy.isAttacking = false;
    
    gsap.to('#playerHealth', {
      width: player.health + "%"
    })
  }

  // if enemy misses
  if (enemy.isAttacking && enemy.framesCurrent === 4) {
    enemy.isAttacking = false;
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

window.addEventListener("keydown", (event) => {
  if (!player.dead) {
    switch (event.key) {
      case "d":
        keys.d.pressed = true;
        player.lastKey = "d";
        break;
      case "a":
        keys.a.pressed = true;
        player.lastKey = "a";
        break;
      case "w":
        if (player.velocity.y === 0) {
          player.velocity.y = -20;
        }
        break;
      case " ":
        player.attack();
        break;
    }
  }

    if (!enemy.dead) {
      switch (event.key) {
        case "ArrowRight":
          keys.ArrowRight.pressed = true;
          enemy.lastKey = "ArrowRight";
          break;
        case "ArrowLeft":
          keys.ArrowLeft.pressed = true;
          enemy.lastKey = "ArrowLeft";
          break;
        case "ArrowUp":
          if (enemy.velocity.y === 0) {
            enemy.velocity.y = -20;
          }
          break;
        case "ArrowDown":
          enemy.attack();
          break;
      }
    }
  }

  //   console.log(event.key);
);

window.addEventListener("keyup", (event) => {
  //   console.log(event.key);
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
  }

  // enemy keys
  switch (event.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }
  //   console.log(event.key);
});
