import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonInput, IonButton, IonItem, IonLabel, IonText, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { gsap } from 'gsap';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonInput, IonButton, IonItem, IonLabel, IonText, IonIcon]
})
export class LoginPage implements AfterViewInit {

  @ViewChild('loginHeader') loginHeader!: ElementRef;
  @ViewChild('loginCard') loginCard!: ElementRef;
  @ViewChild('particleCanvas') particleCanvas!: ElementRef<HTMLCanvasElement>;

  email = '';
  password = '';
  error = '';
  cargando = false;
  mostrarPassword = false;

  private mouse = { x: 0, y: 0 };
  private particles: any[] = [];

  constructor(private authService: AuthService) {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  ngAfterViewInit() {
    this.initParticles();
    this.animateEntrance();
  }

  animateEntrance() {
    gsap.fromTo(this.loginHeader.nativeElement,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    );
    gsap.fromTo(this.loginCard.nativeElement,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.5 }
    );
  }

  initParticles() {
    const canvas = this.particleCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    window.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    for (let i = 0; i < 80; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2 + 1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      this.particles.forEach(p => {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          p.vx += dx / dist * 0.08;
          p.vy += dy / dist * 0.08;
        }

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 3) {
          p.vx = (p.vx / speed) * 3;
          p.vy = (p.vy / speed) * 3;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dist < 150
          ? 'rgba(100, 180, 255, 0.9)'
          : 'rgba(56, 128, 255, 0.6)';
        ctx.fill();
      });

      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(this.particles[i].x, this.particles[i].y);
            ctx.lineTo(this.particles[j].x, this.particles[j].y);
            ctx.strokeStyle = `rgba(56, 128, 255, ${(1 - dist / 100) * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  login() {
    if (!this.email || !this.password) {
      this.error = 'Introduce email y contraseña';
      gsap.fromTo(this.loginCard.nativeElement,
        { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
      );
      return;
    }
    this.cargando = true;
    this.error = '';
    this.authService.login(this.email, this.password).subscribe({
      next: () => { this.cargando = false; },
      error: (err) => {
        this.cargando = false;
        this.error = err.status === 401
          ? 'Email o contraseña incorrectos'
          : 'Error al conectar con el servidor';
        gsap.fromTo(this.loginCard.nativeElement,
          { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
        );
      }
    });
  }
}
