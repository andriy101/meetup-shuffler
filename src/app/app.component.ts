import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import 'rxjs/add/operator/map';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  attendees: any;
  form: FormGroup;
  shuffling: boolean = true;
  winners: any[] = [];

  private shuffleInterval: number = 3000;
  private timer: number;

  // create array of classes ['layout-a', 'layout-b', etc...]
  private aChar = "a".charCodeAt(0);
  randomClasses: string[] = Array.from(Array(7).keys()).map(i => `layout-${String.fromCharCode(this.aChar + i)}`);

  classIndex: number = 0;

  constructor(private http: HttpClient, private fb: FormBuilder) { }

  ngOnInit() {
    console.log('d');
    
    this.form = this.fb.group({
      meetupUrl: ['https://www.meetup.com/ng-swat-tlv/events/250859713/', Validators.required]
    });
  }

  getAttendees(formData) {
    const key = formData.meetupApiKey;
    const url = formData.meetupUrl;

    if (url.includes('meetup.com/') && url.includes('/events/')) {
      let parts = url.split('meetup.com/');
      if (parts[1]) {
        parts = parts[1].split('/');
        if (parts[2] && parts[1] === 'events') {
          const [groupName, eventId] = [parts[0], parts[2]];
          const apiUrl = `https://api.meetup.com/${groupName}/events/${eventId}/rsvps`;

          this.http.jsonp(apiUrl, 'callback').map((res: any) => res.data.filter(i => i.response === 'yes' && !i.member.role).map(m => ({
            name: m.member.name,
            photo: m.member.photo && m.member.photo.photo_link || 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Default-avatar.jpg'
          }))).subscribe(data => {
            this.attendees = data;
            clearTimeout(this.timer);
            this.timer = setTimeout(this.shuffleAttendies, this.shuffleInterval);
          });
        }
      }
    }
  }

  shuffleAttendies = () => {
    if (this.shuffling) {
      this.attendees = this.shuffle(this.attendees);
      this.classIndex = new Date().getTime() % 7;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(this.shuffleAttendies, this.shuffleInterval);
  }

  // https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa#6274398
  shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
      // Pick a random index
      let index = Math.floor(Math.random() * counter);

      // Decrease counter by 1
      counter--;

      // And swap the last element with it
      let temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
    }

    return array;
  }

  getRandomWinner() {
    let randomIndex = Math.floor(Math.random() * this.attendees.length);
    let times = Math.floor(Math.random() * 20) + 30;
    this.attendees = this.shuffle(this.attendees);
    this.winners.push(this.attendees[randomIndex]);
    const interval = setInterval(_ => {
      randomIndex = Math.floor(Math.random() * this.attendees.length);
      this.winners[this.winners.length - 1] = this.attendees[randomIndex];
      if (!(--times)) {
        clearInterval(interval);
        this.attendees.splice(randomIndex, 1);
      }
    }, 77);
  }

  resetWinners() {
    if (this.winners.length) {
      this.attendees = [...this.attendees, ...this.winners];
      this.winners = [];
    }
  }
}
