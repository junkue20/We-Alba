// 이미지 등록 시 미리보기 기능
function handleImageChange(event) {
  const imagePreview = document.getElementById('imagePreview');
  const selectedImage = event.target.files[0];

  if (selectedImage) {
    // 이미지 등록 시
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.setAttribute('src', e.target.result); // 등록한 파일로 이미지변경
    };
    reader.readAsDataURL(selectedImage);
  } else {
    // 이미지 등록이 안된 상태는 기본 이미지 출력
    imagePreview.setAttribute('src', '../assets/pictures/no-image.png');
  }
}

// ---------------------------------------------------------------------------------
// Firebase SDK
const firebaseConfig = {
  apiKey: 'AIzaSyCUfBccVzvG5Eh25qNxqpuerxn2NXotpxo',
  authDomain: 'we-alba-b3313.firebaseapp.com',
  projectId: 'we-alba-b3313',
  storageBucket: 'we-alba-b3313.appspot.com',
  messagingSenderId: '495601569025',
  appId: '1:495601569025:web:a2ad855c6c90f52eed9f00',
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = firebase.storage();

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const idValue = urlParams.get('idvalue');

  if (idValue) {
    const docRef = db.collection('albainfo').doc(idValue);

    docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          // 데이터를 이용하여 폼 필드에 값을 설정하거나 화면에 표시
          $('#imagePreview').attr('src', data.이미지);
          $('#name').val(data.이름);
          $('#phone').val(data.연락처);
          $('#position').val(data.직급);
          $('#workingHours').val(data.근무시간);
        } else {
          console.error('오류발생! 데이터를 불러올 수 없음!');
        }
      })
      .catch((error) => {
        console.log('Error getting document:', error);
      });

    // 이미지 미리보기 업데이트 처리
    function handleImageChange(event) {
      const imagePreview = document.getElementById('imagePreview');
      const selectedImage = event.target.files[0];

      if (selectedImage) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.setAttribute('src', e.target.result);
        };
        reader.readAsDataURL(selectedImage);
      } else {
        imagePreview.setAttribute('src', '../assets/pictures/no-image.png');
      }
    }

    // 수정 버튼 클릭 시 데이터 수정
    $('#sendButton').click(function () {
      const updatedData = {
        이름: $('#name').val(),
        연락처: $('#phone').val(),
        직급: $('#position').val(),
        근무시간: $('#workingHours').val(),
        // 기타 필요한 필드 추가
      };

      // 이미지 업로드 처리
      const selectedImage = $('#photoInput')[0].files[0];
      if (selectedImage) {
        const storageRef = storage.ref(`images/${selectedImage.name}`);
        storageRef
          .put(selectedImage)
          .then((snapshot) => {
            return snapshot.ref.getDownloadURL();
          })
          .then((downloadURL) => {
            // 업로드된 이미지 URL을 데이터와 함께 업데이트
            updatedData.이미지 = downloadURL;
            // 데이터 업데이트
            docRef
              .update(updatedData)
              .then(() => {
                console.log('문서 업데이트 완료');
                // 수정 후 필요한 작업 수행
              })
              .catch((error) => {
                console.error('오류 발생:', error);
              });
          })
          .catch((error) => {
            console.error('이미지 업로드 오류:', error);
          });
      } else {
        // 이미지가 선택되지 않은 경우 데이터만 업데이트
        docRef
          .update(updatedData)
          .then(() => {
            window.location.href = '/albaSelect.html';
            console.log('문서 업데이트 완료');

            // 수정 후 필요한 작업 수행
          })
          .catch((error) => {
            alert('등록실패!');
            console.log(err);
          });
      }
    });

    // '이전으로' 버튼 기능
    const backButton = document.querySelector('.back-button');
    backButton.addEventListener('click', () => {
      window.history.go(-1);
    });
  }
});