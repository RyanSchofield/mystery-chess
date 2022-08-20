import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { GameboardComponent } from './gameboard2/gameboard.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ChatComponent } from './chat/chat.component';

@NgModule({
  declarations: [
    AppComponent,
    GameboardComponent,
    ChatComponent,
  ],
	imports: [
	  // HttpClientModule,
	  BrowserModule,
	  FormsModule,
		DragDropModule,
		// AppRoutingModule,
		HttpClientModule,

// The HttpClientInMemoryWebApiModule module intercepts HTTP requests
// and returns simulated server responses.
// Remove it when a real server is ready to receive requests.
// HttpClientInMemoryWebApiModule.forRoot(
//   InMemoryDataService, { dataEncapsulation: false }
// )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
