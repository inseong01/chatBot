
# 챗봇 채팅 개발 문서
## 목차
### 1. **이해하기**
   - **기능 소개**  
     : 챗봇 채팅의 주요 기능과 작동 방식에 대한 설명  
        - 메시지
        - 접속 인원
        - 접속 목록
        - 챗봇
  
   - **기능 작동 예시**  
     1. 메시지 (메시지 수신/발신 및 상태 처리 샘플 코드)
     2. 접속 인원 (실시간 접속 인원 표시 샘플 코드)
     3. 접속 목록 (접속 중인 사용자 목록을 받아오는 샘플 코드)
     4. 챗봇 (사용자와 챗봇의 기본 대화 흐름 샘플 코드)

   - **JavaScript 활용 예시**  
     : 기능별 JavaScript 활용 링크 안내
     1. 메시지 - [JavaScript 세부설명 이동]
     2. 접속 인원 - [JavaScript 세부설명 이동]
     3. 접속 목록 - [JavaScript 세부설명 이동]
     4. 챗봇 - [JavaScript 세부설명 이동]

### 2. **JavaScript 세부 설명**
   - **메시지 수신/발신/상태**  
     : 클라이언트-서버 간 메시지 송수신 및 상태 처리 샘플 코드
   - **접속 인원**  
     : 실시간 접속 인원 수 관리 로직
   - **접속 목록**  
     : 관리자 패널에서 접속 사용자 목록을 표시하는 방법
   - **챗봇**  
     : 대화형 인터페이스 구현과 사용자 입력 처리

<!-- 
### 3. **보완 사항** (선택적)
   - **상호작용 흐름**: 메시지 전송 및 응답 과정을 다이어그램으로 설명
   - **에러 처리**: 메시지 전송 실패 시 에러 처리 및 상태 코드 설명
   - **보안 고려 사항**: 인증/인가 및 데이터 암호화 처리
   - **테스트 및 디버깅 가이드**: 기능별 테스트 및 디버깅 방법
-->

## 1. 이해하기
이 섹션은 챗봇의 주요 기능과 작동 방식에 대해 설명합니다.

### 기능소개
---
### 메시지
챗봇 채팅은 관리자와 방문자가 1대1로 연락할 수 있는 기능을 제공합니다. 관리자가 온라인일 때 방문자가 관리자에게 직접 연락할 수 있도록 만들어졌습니다.   

챗봇 메시지는 supabase realtime을 활용하여 실시간 연락이 가능합니다. 메시지로 보낸 메시지는 supabase messages table 속성에 맞춰 하나의 행으로 삽입됩니다. 각 행은 room_id를 포함하고 있어, 주고받는 메시지를 구분할 수 있습니다. 

messages table은 특정 조건에 맞춰 행을 삽입/갱신하며, 메시지 상태를 실시간으로 관리할 수 있습니다.

![](./img/msg-img.png)

> *supabase는 이벤트를 구독하는 기능이 있어, 같은 channel을 구독하고 있다면 이벤트 동작을 공유할 수 있습니다.*

### 접속 인원
챗봇 채팅은 현재 접속한 인원을 관리하는 기능을 제공합니다. 관리자와 사용자의 온라인 여부를 확인하기 위해 만들어졌습니다. 

챗봇 접속 인원은 supabase realtime을 활용하여 접속 인원을 실시간으로 관리합니다. 접속 인원 상태 추적은 join, sync, leave로 구성되며 supabase 자체적으로 처리됩니다.    

접속자는 user_status table의 속성에 맞춰 하나의 행으로 삽입됩니다. 접속자 상태는 join, sync, leave 이벤트에 맞춰 갱신되며, 접속자 목록이 동기화(sync) 될 때 room_id를 기준으로 행 중복 삽입이 제한됩니다.  

- **관리자, 접속자 상태 처리**

  ![](./img/user_status_admin.png)

- **사용자, 접속자 상태처리**

  ![](./img/user_status_client.png)

### 접속 목록
챗봇 채팅은 관리자에게 접속 목록 기능을 제공합니다. 다수의 이용자와 1:1 연락을 위해 만들어졌습니다. 해당 기능은 `admin`만 사용할 수 있습니다.

접속 목록은 접속 인원 기능을 활용하여 관리자를 제외한 현재 접속자를 보여줍니다. 접속 목록 기능은 접속 인원 기능과 연계됩니다.  

### 챗봇
챗봇 채팅은 방문자의 응답에 따라 반응하는 챗봇 기능을 제공합니다. 관리자가 오프라인일 때 방문자의 의문을 해소할 수 있도록 만들어졌습니다. 해당 기능은 `client`만 사용할 수 있습니다.

챗봇은 supabase database를 활용하여 bot_questions table에서 등록된 응답을 불러옵니다. 

응답은 bot_questions table 속성에 맞춰 삽입되어 있으며, 상위 질문과 하위 답변으로 구성되어 있습니다. 각 응답 id는 문자열 구조로 구성되어 있으며, 하위 답변일수록 상위 질문 id가 하이픈으로 연결되어 있습니다.

![](./img/chatbot.png)

### 기능 작동 예시
---
<h3>메시지</h3>
<p>
  <b>방문자와 관리자가 메시지를 주고 받는 상황</b>
</p>

![](./gif/chat-bot-seq-chating.gif)

<h3>접속 인원 & 접속 목록</h3>
<p>
  <b>관리자와 방문자의 접속 상태 추적이 이루어는 상황</b>
</p>

![](./gif/chat-bot-seq-list.gif)

<h3>챗봇</h3>
<p>
  <b>방문자가 챗봇을 사용하는 상황</b>
</p>

![](./gif/chat-bot-seq-bot.gif)

### JavaScript 활용 예시
---
| 개발 플랫폼 | 기능 | 참고 |
|:---:|:---:|:---:|
| Supabase | Database | [ 예제 ](#21-supabase-database) 
| - | Realtime | [ 예제 ](#22-supabase-realtime) 
| React | 초기 설정 | [ 예제 ](#23-초기-설정) 
| Javascript | 메시지 | [ 예제 ](#24-메시지) 
| - | 접속 인원 | [ 예제 ](#25-접속-인원)  
| - | 접속 목록 | [ 예제 ](#26-접속-목록) 
| - | 챗봇 | [ 예제 ](#27-챗봇)  

## 2. JavaScript 세부 설명
이 섹션은 JavaScript를 사용한 챗봇 채팅 기능 구현 방법을 안내합니다.

챗봇 채팅은 `Supabase Database`와 `Supabase Realtime`을 기반으로 작동합니다. 기능을 구현을 위해 `Supabse` 새로운 프로젝트 생성을 권장드립니다.

### 2.1. Supabase Database
---
이번 차례는 `Supabase Database` 생성을 안내합니다.

챗봇 채팅은 `messages`, `user_status`, `bot_questions` 총 3개의 **TABLE**에서 데이터를 요청합니다. 

**TABLE 생성 방법**
  1. `Supabase Dashboard`에서 **new project** 클릭하여 새로운 **PROJECT** 생성

  2. 새로운 프로젝트 내에서 **Table Editor** 또는 **SQL editor** 선택 
     - **Table Editor** : 직접 속성 작성하여 새로운 **TABLE** 생성
     
     - **SQL editor** : SQL 코드를 작성하여 새로운 **TABLE** 생성
 
      **Messages TABLE**
      1. Table Editor > new table

          ![](./img/tableEditor1.png)

      2. SQL Editor

          ```sql
          CREATE TABLE messages (
            id int4 PRIMARY KEY DEFAULT nextval('messages_id_seq'::regclass),
            content text,
            created_at timestamp DEFAULT (now() AT TIME ZONE 'KST'::text),
            user_type text,
            room_id text,
            is_read bool
          );
          ```

      **User_status TABLE**

        1. Table Editor > new table

            ![](./img/tableEditor2.png)

        2. SQL Editor
            ```sql
            CREATE TABLE user_status (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              status text,
              online_at timestamp DEFAULT (now() AT TIME ZONE 'KST'::text),
              last_updated text,
              presence_ref text,
              user_type text,
              user_id text,
              room_id uuid,
              is_typing bool DEFAULT false
            );
            ```

      **Bot_questions TABLE**

     1. Table Editor > new table

        ![](./img/tableEditor3.png)

     2. SQL Editor
        ```sql
        CREATE TABLE bot_questions (
          log int2 PRIMARY KEY,
          id text,
          metadata json,
          user_type text DEFAULT 'bot'::text,
          msg_type text DEFAULT 'question'::text,
          memo text
        );
        ```

### 2.2. Supabase Realtime
---
이번 차례는 `Supabase Realtime` 설정을 안내합니다.

`Supabase`는 실시간 데이터 전달을 위한 **Realtime**을 지원합니다. **Realtime**은 임의로 설정해야 합니다. 기본적으로 **Realtime**은 활성화되어 있지 않습니다.

챗봇 채팅은 `messages`, `user_status` 두 개의 **TABLE Realtime**이 활성화 되어 있습니다.

**TABLE Realtime 설정 방법**
  1. `Supabase Dashboard`에서 생성한 **PROJECT** 클릭

  2. 프로젝트 내에서 **Table Editor** 클릭 

  3. 우측 **Realtime Off** 클릭

  4. **Enable realtime** 선택

      [Supabase Reatime Docs 참고](https://supabase.com/docs/guides/realtime?queryGroups=language&language=js)

### 2.3. 초기 설정
---
이번 차례는 `supabase` **REACT 초기 설정**을 안내합니다.

1. **Supabase JS 초기 설정**   
    먼저 `Supabase API`를 사용하기 위해 `@supabase/supabase-js` 패키지를 설치합니다. 

    ```javascript
    // 1. npm install @supabase/supabase-js
    ```

    설치한 패키지로부터 **createClient**를 불러와, 프로젝트 연결을 설정합니다.
    ```javascript
    // 2. Initialize the JS client
    import { createClient } from '@supabase/supabase-js'
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    ```
    > **SUPABASE_URL** / **SUPABASE_ANON_KEY**는 생성한 프로젝트 환경설정에서 확인할 수 있습니다.

2. **React component 초기 설정**   
    **PROJECT**와 연결된 **supabase** 변수를 불러옵니다.    
    `App` 컴포넌트가 처음으로 마운트될 때 **supabase** 이벤트가 구독 되도록 설정합니다.   

    ```javascript
    import supabase from './supabase.js'

    function App() {
      useEffect(function supabaseInitialize() {
        // messages TABLE, 'INSERT' 'UPDATE' 이벤트 구독
        supabase
          .channel('messages')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {})
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {})
          .subscribe()

      }, [])
    }
    ```
    > **.on()** 이벤트 추가 함수, **.subscribe()** 구독 함수    

    `INSERT` 동작이 발생할 때마다 **messages TABLE**로 데이터가 삽입됩니다.   
    삽입된 데이터는 **.on()** 의 세 번째 인자에서 함수를 설정하여 확인할 수 있습니다.   
    **.on()** 함수는 이벤트 구독을 위해 **supabase** 변수에 추가적으로 체이닝 될 수 있습니다. 


### 2.4. 메시지
---
이번 차례는 **메시지** 기능 구현을 설명합니다.    

**초기설정**
```javascript
import supabase from './supabase.js'

function App() {
  useEffect(function supabaseInitialize() {
    // messages TABLE, 'INSERT' 'UPDATE' 이벤트 구독
    supabase
      .channel('messages')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          console.log('INSERT', payload)
        }
      )
      .on(
        'postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'messages' }, 
        (payload) => {
          console.log('UPDATE', payload)
        }
      )
      .subscribe()
      
  }, [])
}
```

### 2.4.1. 메시지 발신

  1. **요청**

      ```javascript
      const sendMessage = async () => {
        const { data , error } = await supabase
          .from('messages')
          .insert([{ content: newMessage, user_type: who, room_id: roomId, is_read: false }])
          .select()
        if (error) return console.error('SendMessage Error', error);
      };
      ```
      - **from** 함수는 이벤트를 동작할 테이블을 설정합니다.    

      - **insert** 함수는 설정한 값을 테이블에 삽입합니다.    
        - `newMessage` : 메시지 내용   

        - `who` : 발신인, 'client' 또는 'admin'    

        - `room_id` : 발신인 고유 ID, 채팅방 역할   

        - `is_read` : 상대 읽음 여부   

      - **select** 함수는 값을 반환합니다.

  2. **응답**   
    **messages TABLE**, 새로운 행으로 **insert() 인자**가 삽입됩니다.
      ```javascript
      data null
      ```

  3. **예제**

### 2.4.2. 메시지 수신

  1. **요청**   
    `INSERT` 이벤트가 작동하면 마운트 되어 있는 해당 **.on()** 함수가 동작합니다.

  2. **응답**   
      ```javascript
      // console.log('INSERT', payload)
      {
        commit_timestamp: "2024-09-30T08:13:31.590Z",
        errors: null,
        eventType: "INSERT",
        new: {
          content: "안녕하세요",
          created_at: "2024-09-30T17:13:31.585542+00:00",
          id: 1,
          is_read: false,
          room_id: "84de1fbd-9220-40ab-baa1-04267b096184",
          user_type: "client"
        }, 
        old: {},
        schema: "public",
        table: "messages"
      }
      // client가 작성한 "안녕하세요"가 읽지 않은 상태로 24.9.30. 17시 13분 부로 messages TABLE의 행으로 삽입됨 
      ```

  3. **예제**

### 2.4.3. 메시지 갱신

  1. **요청**   
      ```javascript
      const updateMessage = async () => {
        const { data, error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .match({ room_id: roomId, user_type: 'who의 상대방', is_read: false })
          .order('id', { ascending: false })
          .select();
        if (error) return console.error('UpdateMessage Error', error);
      };
      ```
      - **from** 함수는 이벤트를 동작할 테이블을 설정합니다.    

      - **update** 함수는 변경할 속성값을 설정합니다.    

      - **match** 함수는 속성값을 변경할 행을 찾습니다.    
        - `room_id` : 발신인 고유 ID, 채팅방 역할   

        - `user_type` : **who** 상대방, 'client'이면 'admin' 또는 'admin'이면 'client'    

        - `is_read` : 상대 읽음 여부   

      - **order** 함수는 첫번째 인자를 기준으로 행을 정렬합니다. 두번째 인자는 오름차순을 설정합니다.

      - **select** 함수는 값을 반환합니다.

  2. **응답**   
      ```javascript
      // console.log('UPDATE', payload)
      {
        schema: "public",
        table: "messages",
        commit_timestamp: "2024-09-30T09:02:01.285Z",
        eventType: "UPDATE",
        new: {
          content: "안녕하세요",
          created_at: "2024-09-30T18:01:42.139884+00:00",
          id: 1,
          is_read: true,
          room_id: "84de1fbd-9220-40ab-baa1-04267b096184",
          user_type: "client"
        },
        old: {
          id: 1
        },
        errors: null
      }
      // client가 작성한 메시지 id가 1인 메시지는 24.9.30. 18시 01분 부로 읽음으로 갱신됨
      ```
      ***update** 함수는 **match** 함수가 충족되어야 동작합니다.*

  3. **예제**


### 2.5. 접속 인원
이번 차례는 접속 인원 상태 추적을 설명합니다.

**초기설정**
```javascript
// Realtime 'presence'
useEffect(function supabaseInitialize() {
  ...
  const roomOne = supabase.channel('room-one');
}, [])
```
**client**, **admin은** 동일한 **channel**을 가지고 있어야 합니다.    
**channel** 함수 인자는 임의 문자열로 할당할 수 있습니다. 

  1. **요청**   
      ```javascript
      roomOne
        .on('presence', { event: 'sync' }, () => {
          const newState = roomOne.presenceState();
          console.log('sync', newState);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('join', newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('leave', leftPresences);
        })
        .subscribe(async (status) => {
          if (status !== 'SUBSCRIBED') return;
          await roomOne.track(userStatus);
        });
      ```
      - **{ event: 'sync' }** : **roomOne** 채널에 접속한 인원 정보 목록을 가져옵니다.    
        *sync는 join, leave와 함께 동작합니다.*

      - **{ event: 'join' }** : **roomOne** 채널에 접속한 인원 정보를 가져옵니다.    

      - **{ event: 'leave' }** : **roomOne** 채널에서 나간 인원 정보를 가져옵니다.    

      - **track** 함수는 사용자를 추적하도록 설정합니다. 인자는 사용자의 정보를 가지고 있습니다.    
        *admin, client 둘 다 track을 설정하지 않으면 'presence' 이벤트가 동작하지 않습니다.*

      **userStatus** 변수 
      ```javascript
      // admin
      const userStatus = {
        user: 'user-1',
        online_at: new Date().toISOString(),
        user_type: who, // 'admin'
        room_id: room_id,
      };

      // client
      const userStatus = {
        user: 'user-2',
        online_at: new Date().toISOString(),
        user_type: who, // 'client'
        room_id: room_id,
      };
      ```

  2. **응답**   
      - **{ event: 'sync' }**      

        ```javascript
        [
          {
            online_at: "2024-09-30T09:31:17.882Z",
            room_id: "84de1fbd-9220-40ab-baa1-04267b096184",
            user: "user-2",
            user_type: "client",
            presence_ref: "F_n7-vOSqXUmmEpE"
          },
          ...
        ]
        ```
      - **{ event: 'join' }**    

        ```javascript
        [
          {
            online_at: "2024-09-30T09:31:17.882Z",
            room_id: "84de1fbd-9220-40ab-baa1-04267b096184",
            user: "user-2",
            user_type: "client",
            presence_ref: "F_n7-vOSqXUmmEpE"
          }
        ]
        ```
     - **{ event: 'leave' }**   

        ```javascript
        [
          {
            online_at: "2024-09-30T09:31:17.882Z",
            room_id: "84de1fbd-9220-40ab-baa1-04267b096184",
            user: "user-2",
            user_type: "client",
            presence_ref: "F_n7-vOSqXUmmEpE"
          }
        ]
        ```
        **presence_ref** 변수는 사용자가 **track** 되었을 때 `supabase`에서 부여하는 임의 식별값 입니다.

  3. **예제**

### 2.6. 접속 목록
이번 차례는 접속 목록 기능을 설명합니다.    
`React` 상태 처리 변수와 `접속 인원` 기능을 활용합니다.   

사용자의 정보는 특정 상황에 갱신되도록 `user_status` TABLE의 `UPDATE` 이벤트를 구독합니다.

  1. **요청**   
      ```javascript
      // 'user_status' TABLE, 'UPDATE' 이벤트 구독
      supabase
        .channel('user_status')
        .on(
          'postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'user_status' }, 
          (payload) => {
            setUserList((prev) => overwriteData(prev, [payload.new], 'user_status'));
          }
        )
        .subscribe();
      ```
      **userList** 인원 중에서 일치하는 인원이 있다면 갱신된 정보를 덮어 씌웁니다.

      ```javascript
      // 접속 인원 기능 활용
      roomOne
        .on('presence', { event: 'sync' }, () => {
          const newState = roomOne.presenceState();
          // 접속되어 있는 인원 목록, userList 업데이트
          Object.keys(newState).forEach((person) => {
            updateLeaveUser('online', newState[person][0].room_id, setUserList);
          });
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          // 입장 인원, userList 업데이트
          setUserList((prev) => preventDuplicatedUser(prev, newPresences));
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          // 나간 인원, userList 업데이트
          updateLeaveUser('offline', key, setUserList);
        })
        ...
      ```
      - **{ event: 'sync' }** : **roomOne** 채널에 접속되어 있는 **userList** 인원을 'online'으로 유지합니다.    

      - **{ event: 'join' }** : **roomOne** 채널에 접속한 인원 정보를 **userList** 변수에 추가합니다.    
      *배열 요소가 중복되지 않도록 함수 내부에서 중복을 걸러냅니다.*

      - **{ event: 'leave' }** : **roomOne** 채널에서 나간 **userList** 인원을 'offline'으로 설정합니다.    

  2. **응답**   
      - **{ event: 'join' }, { event: 'sync' }**      

        ```javascript
        [
          [
            {
              online_at: "2024-09-30T09:31:17.882Z",
              room_id: "84de1fbd-9220-40ab-baa1-04267b096184",
              user: "user-2",
              user_type: "client",
              presence_ref: "F_n7-vOSqXUmmEpE"
            }
          ]
        ]
        ```
      - **{ event: 'leave' }, { event: 'sync' }**    

        ```javascript
        [
          [
            {
              id: "9336069d-d95c-4c03-9ae7-50e4797dbcbb",
              status: "offline",
              online_at: "2024-09-30T09:31:17.882Z",
              last_updated: "1727692230644",
              presence_ref: "F_n7-vOSqXUmmEpE",
              user_type: "client",
              user_id: "b2d0ea1a-7f11-11ef-b530-0a58a9feac02",
              room_id: "84de1fbd-9220-40ab-baa1-04267b096184",
              is_typing: false
            }
          ]
        ]
        ```
     - **'user_status' TABLE, 'UPDATE' 이벤트**   

        ```javascript
        [
          [
            {
              id: "ac2ecbef-0ff3-4855-a746-bd725e471b7f",
              is_typing: true,
              last_updated: "1727692494856",
              online_at: "2024-09-30T09:31:17.882Z",
              presence_ref: "F_n7-vOSqXUmmEpE",
              room_id: "84de1fbd-9220-40ab-baa1-04267b096184",
              status: "online",
              user_id: "92175d94-7f17-11ef-9957-0a58a9feac02",
              user_type: "client"
            }
          ]
        ]
        ```
        **user_status TABLE UPDATE** 이벤트는 사용자의 타이핑 여부를 갱신합니다.

  3. **예제**   
  : 관리자 패널에서 접속 사용자 목록을 표시하는 방법

### 2.7. 챗봇
: 대화형 인터페이스 구현과 사용자 입력 처리