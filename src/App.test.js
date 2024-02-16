import Model from "./model/Model.js";
import App from "./App";
import { render, screen, fireEvent, act } from "@testing-library/react";

describe("Test Application runs and presents puzzle visually", () => {
  test("view", () => {
    render(<App />);
    expect(screen.getByText("Choose A Configuration")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(screen.getByText("Clockwise")).toBeInTheDocument();
    expect(screen.getByText("Counter-Clockwise")).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    const canvas = document.getElementById("canvas");
    expect(canvas).toHaveProperty("getContext");
  });

  test("Clockwise", () => {
    render(<App />);
    fireEvent(
      screen.getByText(/Counter-Clockwise/i),
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    fireEvent(
      screen.getByText("Clockwise"),
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
  });

  test("switch Configuration", () => {
    render(<App />);
    fireEvent(
      screen.getByText("1"),
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    fireEvent(
      screen.getByText("2"),
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    fireEvent(
      screen.getByText("3"),
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
  });

  test("Reset", () => {
    render(<App />);
    fireEvent(
      screen.getByText("Reset"),
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
  });
});

describe("Test new model", () => {
  test("Accepts the argument and returns the correct value", () => {
    // 4x4
    let m4 = new Model(0);
    expect(m4.currentConfig).toEqual(0);
    expect(m4.board.squares).toHaveLength(16);
    // 5x5
    let m5 = new Model(1);
    expect(m5.board.squares).toHaveLength(24);
    // 6x6
    let m6 = new Model(2);
    expect(m6.board.squares).toHaveLength(36);
  });
});

describe("TestCanvasTool", () => {
  test("message", () => {
    render(<App />);
    expect(screen.getByText("Reset and load configuration 0 successfully")).toBeInTheDocument();
  });
  test("load configuration1, click circle, clockwise, reset, message", () => {
    render(<App />);
    const canvas = document.getElementById("canvas");
    // click circle
    const clickEvent = new MouseEvent("click", {
      clientX: 191,
      clientY: 258,
    });
    act(() => {
      canvas.dispatchEvent(clickEvent);
    });
    // click clockwise
    for (let i = 0; i < 18; i++) {
      fireEvent(
        screen.getByText("Clockwise"),
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
        })
      );
    }
    // game over
    expect(screen.getByText("Sorry, you lose the game. You need to complete the game in 16 moves.")).toBeInTheDocument();
    // reset
    fireEvent(
      screen.getByText("Reset"),
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    // load configuration 2
    fireEvent(
      screen.getByText("2"),
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
  });
  test("load configuration3", () => {
    render(<App />);
    const canvas = document.getElementById("canvas");
    fireEvent(
      screen.getByText("3"),
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    expect(screen.getByText("Reset and load configuration 2 successfully")).toBeInTheDocument();
    const clickEvent = new MouseEvent("click", {
      clientX: 200,
      clientY: 260,
    });
    act(() => {
      canvas.dispatchEvent(clickEvent);
    });
    for (let i = 0; i < 6; i++) {
      fireEvent(
        screen.getByText("Counter-Clockwise"),
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
        })
      );
    }
    expect(
      screen.getByText("Sorry, you lose the game. You need to eliminate the dark blue square on the middle 6x6 board in 5 moves.")
    ).toBeInTheDocument();
  });
  test("pairing", () => {
    render(<App />);
    const canvas = document.getElementById("canvas");
    act(() => {
      canvas.dispatchEvent(
        new MouseEvent("click", {
          clientX: 140,
          clientY: 140,
        })
      );
    });
    fireEvent(
      screen.getByText("Counter-Clockwise"),
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    act(() => {
      canvas.dispatchEvent(
        new MouseEvent("click", {
          clientX: 140,
          clientY: 260,
        })
      );
    });
    fireEvent(
      screen.getByText("Clockwise"),
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );
    act(() => {
      canvas.dispatchEvent(
        new MouseEvent("click", {
          clientX: 140,
          clientY: 200,
        })
      );
    });

    act(() => {
      canvas.dispatchEvent(
        new MouseEvent("click", {
          clientX: 140,
          clientY: 200,
        })
      );
    });
  });
  test("win the game", () => {
    render(<App />);
    const canvas = document.getElementById("canvas");
    // C
    act(() => {
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 260, clientY: 140 }));
    });
    fireEvent(screen.getByText("Counter-Clockwise"), new MouseEvent("click", { bubbles: true, cancelable: true }));
    // G
    act(() => {
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 140, clientY: 260 }));
    });
    fireEvent(screen.getByText("Counter-Clockwise"), new MouseEvent("click", { bubbles: true, cancelable: true }));
    // E
    act(() => {
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 200, clientY: 200 }));
    });
    // A
    act(() => {
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 140, clientY: 140 }));
    });
    fireEvent(screen.getByText("Clockwise"), new MouseEvent("click", { bubbles: true, cancelable: true }));
    // C
    act(() => {
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 260, clientY: 140 }));
    });
    fireEvent(screen.getByText("Clockwise"), new MouseEvent("click", { bubbles: true, cancelable: true }));
    // I
    act(() => {
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 260, clientY: 260 }));
    });
    fireEvent(screen.getByText("Clockwise"), new MouseEvent("click", { bubbles: true, cancelable: true }));
    // G
    act(() => {
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 140, clientY: 260 }));
    });
    fireEvent(screen.getByText("Clockwise"), new MouseEvent("click", { bubbles: true, cancelable: true }));
    // E
    act(() => {
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 200, clientY: 200 }));
    });
    // A A
    act(() => {
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 140, clientY: 140 }));
    });
    fireEvent(screen.getByText("Clockwise"), new MouseEvent("click", { bubbles: true, cancelable: true }));
    fireEvent(screen.getByText("Clockwise"), new MouseEvent("click", { bubbles: true, cancelable: true }));
    // G
    act(() => {
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 140, clientY: 260 }));
    });
    fireEvent(screen.getByText("Clockwise"), new MouseEvent("click", { bubbles: true, cancelable: true }));
    // D
    act(() => {
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 140, clientY: 200 }));
    });
    // C
    act(() => {
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 260, clientY: 140 }));
    });
    fireEvent(screen.getByText("Clockwise"), new MouseEvent("click", { bubbles: true, cancelable: true }));
    // I I
    act(() => {
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 260, clientY: 260 }));
    });
    fireEvent(screen.getByText("Clockwise"), new MouseEvent("click", { bubbles: true, cancelable: true }));
    fireEvent(screen.getByText("Clockwise"), new MouseEvent("click", { bubbles: true, cancelable: true }));
    // F
    act(() => {
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 260, clientY: 200 }));
    });
    expect(screen.getByText("Congratulations, you win the game.")).toBeInTheDocument();
    // game over
    act(() => {
      canvas.dispatchEvent(new MouseEvent("click", { clientX: 260, clientY: 200 }));
    });
  });
});
