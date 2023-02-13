---
title: Catching up with friends
description: How do I make sure that I'm focusing on what's most important?
date: 2018-05-08T20:11:04.724Z
categories: [idea]
type: idea
---

Catch up app
Stay in touch with people that matter to you by generating smart reminders

- [ ] Add friends manually
- [ ] Add friends via Contacts
- [ ] Add friends via Calendar
- [ ] Add friends via SMS (android only)
- [ ] Add friends via Gmail
- [ ] Add friends via Gmail Contacts or other sources like outlook
- [ ] View upcoming coffees / dinners
- [ ] Synchronizing Contacts with automatically added ones

App Flow
When you first open the app, your only option is to add somebody new.

A + in the bottom right corner (FAB) allows you to add somebody. After you meet with someone, you can add them. Not before.

Show upcoming events and if there aren’t any add or import from google calendar

Import all contacts into SQLite and just see what happens. Then searching will be super easy

For gmail - get next couple weeks tops of calendar events

What I’m torn is what the initial flow should feel like. Do you connect your calendar / manually add friends? If you manually add friends you need a start / end time perhaps fantastical style where you type b/c otherwise it may feel like a drag idk

Do you then also set a reminder every few weeks months to reach out to that person again? Perhaps that’s it!

Adding Friends Manually

- Name
  - Free text (First, Last, w/e)
- When did you meet?
  - Just now
  - Earlier Today
  - Day ago
- How did you interact?
  - In Person
  - Call
  - Slack
  - Discord
  - Whatsapp
  - Other
- Notes?
  - New job, baby, girlfriend
- Follow Up / Remind Me To Reach Out again In
  - A couple days (2/3)
  - Next Week
  - Next Month
  - Next Year

Adding Friends via Contacts

- Sync your address book to be able to add friends faster. This will also try and sync your previously entered friends.
- Adding friends will now include a “Search your contacts” placeholder text input that will search through your address book.
- Adding contacts should probably be something that happens immediately b/c there could be friction b/w typing in names, etc

Technical Implementations

- React Native vs. Flutter (flutter would be cool, but building in React Native might make it faster)
