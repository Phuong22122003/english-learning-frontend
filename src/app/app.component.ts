import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './shared/loading/loading.component';
import { UserService } from './services/UserService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'english-learning';
  // @HostListener('contextmenu', ['$event'])
  // onRightClick(event: MouseEvent) {
  //   event.preventDefault(); // Ngăn menu chuột phải hiện ra
  // }
  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.loadUserProfile();



    // Anh nhắc em cấm đụng vào.
    // setInterval(() => {
    //   (function () {
    //     debugger;
    //   }());
    // }, 100);


  }

}
