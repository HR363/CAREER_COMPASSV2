import { Routes } from '@angular/router';
import { InboxComponent } from './components/inbox/inbox.component';
import { ConversationComponent } from './components/conversation/conversation.component';

export const messagesRoutes: Routes = [
  {
    path: '',
    component: InboxComponent
  },
  {
    path: 'conversation/:userId',
    component: ConversationComponent
  }
];
