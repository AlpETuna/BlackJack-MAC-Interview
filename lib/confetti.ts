let globalTimer: any = undefined;
let globalFrame: any = undefined;
let globalContainer: HTMLDivElement | null = null;

export function stopConfetti() {
  if (globalTimer) {
    clearTimeout(globalTimer);
    globalTimer = undefined;
  }
  if (globalFrame) {
    cancelAnimationFrame(globalFrame);
    globalFrame = undefined;
  }
  if (globalContainer && document.body.contains(globalContainer)) {
    document.body.removeChild(globalContainer);
    globalContainer = null;
  }
}

export function triggerConfetti() {
  // Stop any existing confetti first
  stopConfetti();
  
  const random = Math.random;
  const cos = Math.cos;
  const sin = Math.sin;
  const PI = Math.PI;
  const PI2 = PI * 2;
  let timer: any = undefined;
  let frame: any = undefined;
  const confetti: any[] = [];

  const particles = 10;
  const spread = 40;
  const sizeMin = 3;
  const sizeMax = 12 - sizeMin;
  const eccentricity = 10;
  const deviation = 100;
  const dxThetaMin = -0.1;
  const dxThetaMax = -dxThetaMin - dxThetaMin;
  const dyMin = 0.13;
  const dyMax = 0.18;
  const dThetaMin = 0.4;
  const dThetaMax = 0.7 - dThetaMin;

  const colorThemes = [
    function() {
      return color(200 * random() | 0, 200 * random() | 0, 200 * random() | 0);
    }
  ];

  function color(r: number, g: number, b: number) {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function interpolation(a: number, b: number, t: number) {
    return (1 - cos(PI * t)) / 2 * (b - a) + a;
  }

  const radius = 1 / eccentricity;
  const radius2 = radius + radius;

  function createPoisson() {
    let domain = [radius, 1 - radius];
    let measure = 1 - radius2;
    const spline = [0, 1];
    
    while (measure) {
      const dart = measure * random();
      let i, l, interval, a, b, c, d;
      let dartPosition = 0;

      for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
        a = domain[i];
        b = domain[i + 1];
        interval = b - a;
        if (dart < measure + interval) {
          dartPosition = dart + a - measure;
          spline.push(dartPosition);
          break;
        }
        measure += interval;
      }
      c = dartPosition - radius;
      d = dartPosition + radius;

      for (i = domain.length - 1; i > 0; i -= 2) {
        l = i - 1;
        a = domain[l];
        b = domain[i];
        if (a >= c && a < d) {
          if (b > d) domain[l] = d;
          else domain.splice(l, 2);
        } else if (a < c && b > c) {
          if (b <= d) domain[i] = c;
          else domain.splice(i, 0, c, d);
        }
      }

      for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
        measure += domain[i + 1] - domain[i];
      }
    }

    return spline.sort();
  }

  globalContainer = document.createElement('div');
  globalContainer.style.position = 'fixed';
  globalContainer.style.top = '0';
  globalContainer.style.left = '0';
  globalContainer.style.width = '100%';
  globalContainer.style.height = '0';
  globalContainer.style.overflow = 'visible';
  globalContainer.style.zIndex = '9999';
  const container = globalContainer;

  class Confetto {
    frame: number = 0;
    outer: HTMLDivElement;
    inner: HTMLDivElement;
    axis: string;
    theta: number;
    dTheta: number;
    x: number;
    y: number;
    dx: number;
    dy: number;
    splineX: number[];
    splineY: number[];

    constructor(theme: any) {
      this.outer = document.createElement('div');
      this.inner = document.createElement('div');
      this.outer.appendChild(this.inner);

      const outerStyle = this.outer.style;
      const innerStyle = this.inner.style;
      outerStyle.position = 'absolute';
      outerStyle.width = (sizeMin + sizeMax * random()) + 'px';
      outerStyle.height = (sizeMin + sizeMax * random()) + 'px';
      innerStyle.width = '100%';
      innerStyle.height = '100%';
      innerStyle.backgroundColor = theme();

      outerStyle.perspective = '50px';
      outerStyle.transform = 'rotate(' + (360 * random()) + 'deg)';
      this.axis = 'rotate3D(' +
        cos(360 * random()) + ',' +
        cos(360 * random()) + ',0,';
      this.theta = 360 * random();
      this.dTheta = dThetaMin + dThetaMax * random();
      innerStyle.transform = this.axis + this.theta + 'deg)';

      this.x = window.innerWidth * random();
      this.y = -deviation;
      this.dx = sin(dxThetaMin + dxThetaMax * random());
      this.dy = dyMin + dyMax * random();
      outerStyle.left = this.x + 'px';
      outerStyle.top = this.y + 'px';

      this.splineX = createPoisson();
      this.splineY = [];
      for (let i = 1, l = this.splineX.length - 1; i < l; ++i) {
        this.splineY[i] = deviation * random();
      }
      this.splineY[0] = this.splineY[this.splineX.length - 1] = deviation * random();
    }

    update(height: number, delta: number): boolean {
      this.frame += delta;
      this.x += this.dx * delta;
      this.y += this.dy * delta;
      this.theta += this.dTheta * delta;

      const phi = (this.frame % 7777) / 7777;
      let i = 0, j = 1;
      while (phi >= this.splineX[j]) i = j++;
      const rho = interpolation(
        this.splineY[i],
        this.splineY[j],
        (phi - this.splineX[i]) / (this.splineX[j] - this.splineX[i])
      );
      const phiRad = phi * PI2;

      this.outer.style.left = this.x + rho * cos(phiRad) + 'px';
      this.outer.style.top = this.y + rho * sin(phiRad) + 'px';
      this.inner.style.transform = this.axis + this.theta + 'deg)';
      return this.y > height + deviation;
    }
  }

  if (!frame) {
    document.body.appendChild(container);

    const theme = colorThemes[0];
    (function addConfetto() {
      const confetto = new Confetto(theme);
      confetti.push(confetto);
      container.appendChild(confetto.outer);
      timer = globalTimer = setTimeout(addConfetto, spread * random());
    })();

    let prev: any = undefined;
    requestAnimationFrame(function loop(timestamp) {
      const delta = prev ? timestamp - prev : 0;
      prev = timestamp;
      const height = window.innerHeight;

      for (let i = confetti.length - 1; i >= 0; --i) {
        if (confetti[i].update(height, delta)) {
          container.removeChild(confetti[i].outer);
          confetti.splice(i, 1);
        }
      }

      if (timer || confetti.length) {
        return frame = globalFrame = requestAnimationFrame(loop);
      }

      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      frame = globalFrame = undefined;
      globalContainer = null;
    });
  }
}