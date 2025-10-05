export function triggerConfetti() {
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

      for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
        a = domain[i];
        b = domain[i + 1];
        interval = b - a;
        if (dart < measure + interval) {
          spline.push(dart + a - measure);
          break;
        }
        measure += interval;
      }
      c = (dart + a - measure) - radius;
      d = (dart + a - measure) + radius;

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

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '0';
  container.style.overflow = 'visible';
  container.style.zIndex = '9999';

  function Confetto(theme: any) {
    (this as any).frame = 0;
    (this as any).outer = document.createElement('div');
    (this as any).inner = document.createElement('div');
    (this as any).outer.appendChild((this as any).inner);

    const outerStyle = (this as any).outer.style;
    const innerStyle = (this as any).inner.style;
    outerStyle.position = 'absolute';
    outerStyle.width = (sizeMin + sizeMax * random()) + 'px';
    outerStyle.height = (sizeMin + sizeMax * random()) + 'px';
    innerStyle.width = '100%';
    innerStyle.height = '100%';
    innerStyle.backgroundColor = theme();

    outerStyle.perspective = '50px';
    outerStyle.transform = 'rotate(' + (360 * random()) + 'deg)';
    (this as any).axis = 'rotate3D(' +
      cos(360 * random()) + ',' +
      cos(360 * random()) + ',0,';
    (this as any).theta = 360 * random();
    (this as any).dTheta = dThetaMin + dThetaMax * random();
    innerStyle.transform = (this as any).axis + (this as any).theta + 'deg)';

    (this as any).x = window.innerWidth * random();
    (this as any).y = -deviation;
    (this as any).dx = sin(dxThetaMin + dxThetaMax * random());
    (this as any).dy = dyMin + dyMax * random();
    outerStyle.left = (this as any).x + 'px';
    outerStyle.top = (this as any).y + 'px';

    (this as any).splineX = createPoisson();
    (this as any).splineY = [];
    for (let i = 1, l = (this as any).splineX.length - 1; i < l; ++i) {
      (this as any).splineY[i] = deviation * random();
    }
    (this as any).splineY[0] = (this as any).splineY[(this as any).splineX.length - 1] = deviation * random();

    (this as any).update = function(height: number, delta: number) {
      (this as any).frame += delta;
      (this as any).x += (this as any).dx * delta;
      (this as any).y += (this as any).dy * delta;
      (this as any).theta += (this as any).dTheta * delta;

      const phi = ((this as any).frame % 7777) / 7777;
      let i = 0, j = 1;
      while (phi >= (this as any).splineX[j]) i = j++;
      const rho = interpolation(
        (this as any).splineY[i],
        (this as any).splineY[j],
        (phi - (this as any).splineX[i]) / ((this as any).splineX[j] - (this as any).splineX[i])
      );
      const phiRad = phi * PI2;

      outerStyle.left = (this as any).x + rho * cos(phiRad) + 'px';
      outerStyle.top = (this as any).y + rho * sin(phiRad) + 'px';
      innerStyle.transform = (this as any).axis + (this as any).theta + 'deg)';
      return (this as any).y > height + deviation;
    };
  }

  if (!frame) {
    document.body.appendChild(container);

    const theme = colorThemes[0];
    (function addConfetto() {
      const confetto = new (Confetto as any)(theme);
      confetti.push(confetto);
      container.appendChild(confetto.outer);
      timer = setTimeout(addConfetto, spread * random());
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
        return frame = requestAnimationFrame(loop);
      }

      document.body.removeChild(container);
      frame = undefined;
    });
  }
}