// Firebase SDK
import { initializeFirebase } from './firebaseSDK.js';
const { db } = initializeFirebase();

// 알바생 데이터 받아옴
db.collection('albainfo')
  .get()
  .then((result) => {
    result.forEach((doc) => {
      var tr = /* html */ `
      <tr>
        <td class="select-checkbox">
          <label class="container">
            <input type="checkbox" />
            <div class="checkmark"></div>
          </label>
        </td>
        <td class="alba-photo">
          <img src="${doc.data().이미지}" alt="알바생 사진" />
        </td>
        <td class="alba-name"><p>${doc.data().이름}</p></td>
        <td class="alba-phone"><p>${doc.data().연락처}</p></td>
        <td class="alba-class"><p>${doc.data().직급}</p></td>
        <td class="alba-worktime"><p>${doc.data().근무시간}</p></td>
        <td><button class="edit-button">조회하기</button></td>
      </tr>
      `;
      $('.alba-list-body').append(tr);
    });
  });

// '조회하기' 버튼 클릭 이벤트 리스너 등록
$(document).on('click', '.edit-button', function () {
  // 클릭한 버튼의 부모 요소에서 데이터 가져오기
  const $parentRow = $(this).closest('tr');
  const phoneNum = $parentRow.find('.alba-phone p').text();

  // 데이터베이스에서 해당하는 데이터 가져오기
  db.collection('albainfo')
    .where('연락처', '==', phoneNum)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        // 데이터가 없을경우 리턴.
        return;
      }
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      // 모달창에 데이터 채우기
      document.querySelector('.modal-left-container img').src = data.이미지;
      document.querySelectorAll('.modal-right-container p')[0].textContent = data.이름;
      document.querySelectorAll('.modal-right-container p')[1].textContent = data.직급;
      document.querySelectorAll('.modal-right-container p')[2].textContent = data.연락처;
      document.querySelectorAll('.modal-right-container p')[3].textContent = data.근무시간;
      // 모달창 띄우기
      $('.modal-container').fadeIn();

      // 모달창 버튼 클릭 이벤트 리스너 등록
      $('.update-button').on('click', function () {
        // 정보수정 이동
        const id = doc.id;
        window.location.href = `albaUpdate.html?idvalue=${id}`;
        $('.modal-container').fadeOut();입
      });
      $('.close-button').on('click', function () {
        // 모달창 닫기
        $('.modal-container').fadeOut();
      });
    })
    .catch((error) => {
      console.error('Error getting document:', error);
    });
});
// -------------------------------------------------------------------------------------
// 알바생 데이터 삭제
$(document).ready(function () {
  // 삭제 버튼 누르기
  $(document).on('click', '.alba-delete-button', function () {
    // 선택한 알바생 데이터의 id값 추출하여 배열에 저장
    const selectedIds = [];

    // 체크박스 확인
    $('.alba-list-body input[type="checkbox"]:checked').each(async function () {
      const $parentRow = $(this).closest('tr');
      const phoneNum = $parentRow.find('.alba-phone p').text();
      const collection = db.collection('albainfo');
      const docRef = collection.where('연락처', '==', phoneNum);
      const querySnapshot = await docRef.get();
      const storage = firebase.storage();

      if (querySnapshot.size > 0) {
        const doc = querySnapshot.docs[0];
        const id = doc.id;
        selectedIds.push(id);
      }

      const deleteButton = $('.alba-delete-button');
      if (selectedIds.length > 0) {
        deleteButton.removeClass('disabled-button').prop('disabled', false);
      } else {
        deleteButton.addClass('disabled-button').prop('disabled', true);
      }

      if (selectedIds.length > 0) {
        console.log(123);
        $('.confirm-modal-container').fadeIn();
        // 삭제하기 버튼 클릭 이벤트 리스너 등록
        const confirmButton = document.querySelector('.confirm-button');
        confirmButton.addEventListener('click', async function () {
          // 선택한 알바생 데이터 삭제 처리
          const deletePromises = selectedIds.map(async (id) => {
            // Firestore에서 해당 데이터 가져오기
            const docRef = db.collection('albainfo').doc(id);
            const docRefData = await docRef.get();

            // Firestore 문서에 저장된 이미지 URL주소 가져오기
            const imageData = docRefData.data();
            const imageUrl = imageData.이미지; // 속성값에서 이미지 파일 URL 추출

            // Firestore DB에서 데이터 삭제
            await docRef.delete();

            // Storage에서 이미지 삭제
            if (imageUrl) {
              const storageRef = storage.refFromURL(imageUrl);
              await storageRef.delete();
            }
          });

          // 삭제 Promise 모두 완료될 때까지 기다림
          await Promise.all(deletePromises);
          window.location.href = 'albaSelect.html'; // 새로고침 기능
        });
      } else {
        console.log(123);
        $('.no-selection-modal-container').fadeIn();
        return;
      }
    });
  });
});

/* ----------------------------------------------------------------------------------- */

// '알바생 등록하기' 버튼 기능
const registerButton = document.querySelector('.alba-register-button');
registerButton.addEventListener('click', () => {
  window.location.href = './albaRegister.html';
});

// '이전 페이지로' 버튼 기능
const backButton = document.querySelector('.back-button');
backButton.addEventListener('click', () => {
  window.location.href = './myAlba.html';
});

/* ----------------------------------------------------------------------------------- */

// 모달창 닫기
$('.cancel-button').on('click', async function () {
  $('.confirm-modal-container').fadeOut();
});
$('.close-button').on('click', async function () {
  $('.no-selection-modal-container').fadeOut();
});
