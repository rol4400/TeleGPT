var result = await client.invoke(
        new Api.messages.SearchGlobal({
          q: "basket",
          filter: new Api.InputMessagesFilterContacts({}),
          minDate: -1,
          maxDate: -1,
          offsetRate: 0,
          offsetPeer: "username",
          offsetId: 0,
          limit: 20,
          folderId: 0,
        })
      );


      var result = await client.invoke(
        new Api.contacts.GetContacts({})
      );


      var result = await client.invoke(
        new Api.messages.Search({
          q: "basket",
          peer: BigInt("-1734508502"),
          filter: new Api.InputMessagesFilterEmpty({}),
          minDate: -1,
          maxDate: -1,
          offsetRate: 0,
          offsetPeer: "username",
          offsetId: 0,
          limit: 20,
          folderId: 0,
        })
      );


      var result = await client.invoke(
        new Api.contacts.Search({
          q: "basket",
          limit: 5,
        })
      );

      Data = result.chats.map(chat => {
        return {
                "Title": chat.title,
                "ChatID": -Number(chat.id.value)
        }
      })

      const {Api, TelegramClient} = require('telegram');
        const {StringSession} = require('telegram/sessions');

        const apiId = 29908856;
        const apiHash = "9a71691416fa1739b9c38e66f3a7f391";
        const session = new StringSession( "1BQANOTEuMTA4LjU2LjE2MAG7J05/zsddgHLO5YTWp62CHdi0fACL5UTTazDrhUoi5w6IcZuqaBiQm8+xZGe1w5znhjW4qkGU7BGjeLbTfsv8jElDgNmupP0DJJOoOeuyqgvpfQDaUHtuH5+Cp7bO3nbCjdQmbihYLl2IigjCX8T5VyCwXtITp2Sc132UWVibOwchF9IJmozFbQ/Vlai+KLY1LuNgqZnEhZSIWBie6auS9CNK5Bc0zPIcXfSpN+a6X57buHtpy956qlRpA/8D0sRQZDvhRPziB2qQ7xpURtGvXNQIpr7wVZ6uFXsimMfZF10FtwFWeDFxtF49zNpFSnGTs6sjs9VSD64TNga2TAsYDg==");
        const client = new TelegramClient(session, apiId, apiHash, {});
        await client.connect()



      Data = result.messages.map(message => {
        const username = result.users.find(user => user.id === message.fromId)?.username || 'N/A';
        
        // Find the chat associated with the message based on the chat's ID
        const chat = result.chats.find(chat => chat.id.value === message.peerId.channelId.value).title || 'N/A';
        
        const messageText = message.message;
        
        return {
          username,
          chat,
          messageText,
        };
      });



      Data = result.messages.map(message => {
        var username = "";
        //result.users.find(user => user.id === message.fromId)?.username || 'N/A';
      
        var chat;
        // Check if peerId has channelId, otherwise, set chat to 'N/A'
        if (message.peerId.className == "PeerChannel") {
           chat = result.chats.find(chat => chat.id.value === message.peerId.channelId.value).title;

           if (message.fromId.className == "PeerUser") {
                const user = result.users.find(user => user.id.value === message.fromId.userId.value);
                const firstName = user?.firstName || 'N/A';
                const lastName = user?.lastName || '';

                // Create the username by combining firstName and lastName
                username = (firstName && lastName) ? `${firstName} ${lastName}` : firstName || lastName || 'N/A';

           }
        } else {
                chat = "N/A"
                const user = result.users.find(user => user.id.value === message.peerId.userId.value)
                const firstName = user?.firstName || 'N/A';
                const lastName = user?.lastName || '';

                // Create the username by combining firstName and lastName
                username = (firstName && lastName) ? `${firstName} ${lastName}` : firstName || lastName || 'N/A';

        }

        // Define a maximum messageText length (e.g., 100 characters)
        const maxMessageTextLength = 100;
        let messageText = message.message || '';

        // Truncate messageText if it exceeds the maximum length
        if (messageText.length > maxMessageTextLength) {
        messageText = messageText.slice(0, maxMessageTextLength) + '...';
        }
              
        return {
          username,
          chat,
          messageText,
        };
      });




      // Get unread

      result = await client.invoke(
        new Api.messages.GetDialogs({
          offsetDate: 0,
          offsetId: 0,
          offsetPeer: "username",
          limit: 30,
          hash: BigInt("-4156887774564"),
          excludePinned: true,
          folderId: 0,
        })
      );

      var dateLimit = Math.floor(Date.now()/1000);

      // Remove already read dates
      var filteredDialogs = result.dialogs.filter(dialog => {
        var message = result.messages.find(message => message.id === dialog.topMessage);
        return (message.date > dateLimit);
      });

      var mapped = filteredDialogs.map(dialog => {
        var chat;
        var message = result.messages.find(message => message.id === dialog.topMessage).message;

        var username = "Unknown Chat";
      
        switch (dialog.peer.className) {
          case 'PeerChannel':
            chat = result.chats.find(chat => chat.id.value === dialog.peer.channelId.value);
            break;
          case 'PeerUser':
            user = result.users.find(user => user.id.value === dialog.peer.userId.value);

            const firstName = user?.firstName || 'N/A';
            const lastName = user?.lastName || '';

            // Create the username by combining firstName and lastName
            username = (firstName && lastName) ? `${firstName} ${lastName}` : firstName || lastName || 'N/A';

            break;
          case 'PeerChat':
            chat = result.chats.find(chat => chat.id.value === dialog.peer.chatId.value);
            break;
          default:
            chat = null; // Handle any other cases as needed
            break;
        }
      
        return {
          "Title": chat ? chat.title : username,
          "chat_id": chat ? -Number(chat.id.value) : -1, // Default chat_id value
          "number_unread": dialog.unreadCount,
          "top_message_id": message ? dialog.topMessage : null // Default top_message_id value
        };
      });
      

      const result = await client.invoke(
        new Api.messages.GetUnreadMentions({
          peer: new Api.InputPeerSelf({}),
          offsetId: 0,
          addOffset: 0,
          limit: 5,
          maxId: -1,
          minId: -1,
        })
      );

      result = await client.invoke(new Api.updates.GetState({}));

      result = await client.invoke(new Api.updates.DifferenceTooLong({
        pts: 100
      }));



      result = await client.invoke(
        new Api.updates.GetDifference({
          pts: 23,
          date: Date.now(),
          qts: 0,
          ptsTotalLimit: 43,
        }));




        result = await client.invoke(
                new Api.contacts.GetTopPeers({
                  offset: 0,
                  limit: 10,
                  hash: BigInt(""),
                  correspondents: true,
                  botsPm: false,
                  botsInline: false,
                  phoneCalls: true,
                  forwardUsers: true,
                  forwardChats: true,
                  groups: true,
                  channels: true,
                })
              );

              unread_messages = [];
              Data = result.users.map(async (user) => {
                const unread = await client.invoke(
                        new Api.messages.GetUnread({
                          peer: new Api.InputPeerUser({
                                userId: Number(user3.id.value),
                                accessHash: BigInt(user3.accessHash.value)
                          }),
                          offsetId: 43,
                          addOffset: 0,
                          limit: 100,
                          maxId: 0,
                          minId: 0,
                        })
                      );

                const 
                

              })





result = await client.invoke(
new Api.updates.GetChannelDifference({
        channel: new Api.InputPeerChannel({
                channelId: class1.id.value
        }),
        filter: new Api.ChannelMessagesFilter({
                ranges: [
                new Api.MessageRange({
                        minId: 0,
                        maxId: 0,
                }),
        ],
        excludeNewMessages: true,
        }),
        pts: 43,
        limit: 100,
        force: true,
})
);

