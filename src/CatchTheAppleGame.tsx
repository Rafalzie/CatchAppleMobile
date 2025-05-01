import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

class CatchTheApple extends Phaser.Scene {
  basket!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  apple!: Phaser.GameObjects.Ellipse & { body: Phaser.Physics.Arcade.Body };
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  scoreText!: Phaser.GameObjects.Text;
  score: number = 0;
  speed: number = 150;

  constructor() {
    super("CatchTheApple");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.score = 0;
    this.speed = 150;

    this.cameras.main.setBackgroundColor("#ffffff");
    this.scoreText = this.add.text(10, 10, "Level: 0", {
      fontSize: "20px",
      color: "#000",
    });

    const basketYOffset = 100; // Move basket up from bottom
    this.basket = this.add.rectangle(
      width / 2,
      height - basketYOffset,
      80,
      20,
      0x0000ff
    ) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    this.physics.add.existing(this.basket);
    this.basket.body.setCollideWorldBounds(true).setImmovable(true);

    this.apple = this.add.ellipse(
      Phaser.Math.Between(20, width - 20),
      0,
      20,
      20,
      0xff0000
    ) as Phaser.GameObjects.Ellipse & { body: Phaser.Physics.Arcade.Body };
    this.physics.add.existing(this.apple);

    this.cursors = this.input.keyboard.createCursorKeys();

    // Improved touch movement
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      const basketCenterX = this.basket.x;
      const pointerX = pointer.x;
      const diff = pointerX - basketCenterX;

      const threshold = 10;
      if (Math.abs(diff) > threshold) {
        this.basket.body.setVelocityX(diff * 5);
      } else {
        this.basket.body.setVelocityX(0);
      }
    });

    this.physics.add.overlap(
      this.basket,
      this.apple,
      this.catchApple,
      undefined,
      this
    );
  }

  update() {
    if (this.cursors.left?.isDown) {
      this.basket.body.setVelocityX(-300);
    } else if (this.cursors.right?.isDown) {
      this.basket.body.setVelocityX(300);
    } else if (!this.input.activePointer.isDown) {
      this.basket.body.setVelocityX(0);
    }

    this.apple.body.setVelocityY(this.speed);

    if (this.apple.y > this.scale.height) {
      this.scene.start("GameOver", { score: this.score });
    }
  }

  catchApple = () => {
    this.score++;
    this.speed += 10;
    this.apple.setY(0);
    this.apple.setX(Phaser.Math.Between(20, this.scale.width - 20));
    this.scoreText.setText("Level: " + this.score);
  };
}

class GameOver extends Phaser.Scene {
  finalScore: number = 0;

  constructor() {
    super("GameOver");
  }

  init(data: { score: number }) {
    this.finalScore = data.score;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.cameras.main.setBackgroundColor("#ffffff");
    this.add
      .text(width / 2, height / 2 - 50, "Game Over!", {
        fontSize: "36px",
        color: "#ff0000",
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2, `Score: ${this.finalScore}`, {
        fontSize: "24px",
        color: "#000",
      })
      .setOrigin(0.5);

    const restart = this.add
      .text(width / 2, height / 2 + 60, "Click to Restart", {
        fontSize: "20px",
        color: "#000",
      })
      .setOrigin(0.5);
    restart.setInteractive();
    restart.on("pointerdown", () => {
      this.scene.start("CatchTheApple");
    });
  }
}

const CatchTheAppleGame: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: gameRef.current || undefined,
      backgroundColor: "#ffffff",
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: [CatchTheApple, GameOver],
    };

    const game = new Phaser.Game(config);

    const resize = () => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default CatchTheAppleGame;
