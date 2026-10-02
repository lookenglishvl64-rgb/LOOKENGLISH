export const FLUTTER_DART_MODELS_CODE = `// ==========================================
// 1. USER MODEL (user_model.dart)
// ==========================================
import 'package:cloud_firestore/cloud_firestore.dart';

enum UserRole { admin, teacher, student, parent }

extension UserRoleExtension on UserRole {
  String get value => name;
  static UserRole fromString(String val) {
    return UserRole.values.firstWhere(
      (e) => e.name.toLowerCase() == val.toLowerCase(),
      orElse: () => UserRole.student,
    );
  }
}

class UserModel {
  final String id;
  final String name;
  final UserRole role;
  final String email;
  final String? classId;
  final String? phone;
  final String? avatar;
  final String? parentOfStudentId;

  UserModel({
    required this.id,
    required this.name,
    required this.role,
    required this.email,
    this.classId,
    this.phone,
    this.avatar,
    this.parentOfStudentId,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, [String? docId]) {
    return UserModel(
      id: docId ?? json['id'] ?? '',
      name: json['name'] ?? '',
      role: UserRoleExtension.fromString(json['role'] ?? 'student'),
      email: json['email'] ?? '',
      classId: json['classId'],
      phone: json['phone'],
      avatar: json['avatar'],
      parentOfStudentId: json['parentOfStudentId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'role': role.value,
      'email': email,
      'classId': classId,
      'phone': phone,
      'avatar': avatar,
      'parentOfStudentId': parentOfStudentId,
    };
  }

  UserModel copyWith({
    String? id,
    String? name,
    UserRole? role,
    String? email,
    String? classId,
    String? phone,
    String? avatar,
    String? parentOfStudentId,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      role: role ?? this.role,
      email: email ?? this.email,
      classId: classId ?? this.classId,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      parentOfStudentId: parentOfStudentId ?? this.parentOfStudentId,
    );
  }
}

// ==========================================
// 2. CLASS MODEL (class_model.dart)
// ==========================================
class ClassModel {
  final String id;
  final String className;
  final String teacherId;
  final List<String> studentList;
  final String? level;
  final String? schedule;
  final String? room;
  final int maxCapacity;

  ClassModel({
    required this.id,
    required this.className,
    required this.teacherId,
    required this.studentList,
    this.level,
    this.schedule,
    this.room,
    this.maxCapacity = 20,
  });

  factory ClassModel.fromJson(Map<String, dynamic> json, [String? docId]) {
    return ClassModel(
      id: docId ?? json['id'] ?? '',
      className: json['className'] ?? '',
      teacherId: json['teacherId'] ?? '',
      studentList: List<String>.from(json['studentList'] ?? []),
      level: json['level'],
      schedule: json['schedule'],
      room: json['room'],
      maxCapacity: json['maxCapacity'] ?? 20,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'className': className,
      'teacherId': teacherId,
      'studentList': studentList,
      'level': level,
      'schedule': schedule,
      'room': room,
      'maxCapacity': maxCapacity,
    };
  }

  ClassModel copyWith({
    String? id,
    String? className,
    String? teacherId,
    List<String>? studentList,
    String? level,
    String? schedule,
    String? room,
    int? maxCapacity,
  }) {
    return ClassModel(
      id: id ?? this.id,
      className: className ?? this.className,
      teacherId: teacherId ?? this.teacherId,
      studentList: studentList ?? this.studentList,
      level: level ?? this.level,
      schedule: schedule ?? this.schedule,
      room: room ?? this.room,
      maxCapacity: maxCapacity ?? this.maxCapacity,
    );
  }
}

// ==========================================
// 3. ATTENDANCE MODEL (attendance_model.dart)
// ==========================================
enum AttendanceStatus { present, absent }

extension AttendanceStatusExtension on AttendanceStatus {
  String get value => name;
  static AttendanceStatus fromString(String val) {
    return val.toLowerCase() == 'present'
        ? AttendanceStatus.present
        : AttendanceStatus.absent;
  }
}

class AttendanceModel {
  final String id;
  final String classId;
  final String studentId;
  final DateTime date;
  final AttendanceStatus status;
  final String? note;

  AttendanceModel({
    required this.id,
    required this.classId,
    required this.studentId,
    required this.date,
    required this.status,
    this.note,
  });

  factory AttendanceModel.fromJson(Map<String, dynamic> json, [String? docId]) {
    DateTime parsedDate;
    if (json['date'] is Timestamp) {
      parsedDate = (json['date'] as Timestamp).toDate();
    } else if (json['date'] is String) {
      parsedDate = DateTime.tryParse(json['date']) ?? DateTime.now();
    } else {
      parsedDate = DateTime.now();
    }

    return AttendanceModel(
      id: docId ?? json['id'] ?? '',
      classId: json['classId'] ?? '',
      studentId: json['studentId'] ?? '',
      date: parsedDate,
      status: AttendanceStatusExtension.fromString(json['status'] ?? 'present'),
      note: json['note'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'classId': classId,
      'studentId': studentId,
      'date': Timestamp.fromDate(date),
      'status': status.value,
      'note': note,
    };
  }
}

// ==========================================
// 4. GRADE MODEL (grade_model.dart)
// ==========================================
enum SkillType { listening, speaking, reading, writing, test }

extension SkillTypeExtension on SkillType {
  String get value => name;
  String get vietnameseLabel {
    switch (this) {
      case SkillType.listening: return 'Nghe (Listening)';
      case SkillType.speaking: return 'Nói (Speaking)';
      case SkillType.reading: return 'Đọc (Reading)';
      case SkillType.writing: return 'Viết (Writing)';
      case SkillType.test: return 'Kiểm tra Định kỳ';
    }
  }

  static SkillType fromString(String val) {
    return SkillType.values.firstWhere(
      (e) => e.name.toLowerCase() == val.toLowerCase(),
      orElse: () => SkillType.test,
    );
  }
}

class GradeModel {
  final String id;
  final String studentId;
  final SkillType skill;
  final double score; // 0.0 - 10.0 scale or 0.0 - 9.0 IELTS band
  final DateTime date;
  final String? comment;

  GradeModel({
    required this.id,
    required this.studentId,
    required this.skill,
    required this.score,
    required this.date,
    this.comment,
  });

  factory GradeModel.fromJson(Map<String, dynamic> json, [String? docId]) {
    return GradeModel(
      id: docId ?? json['id'] ?? '',
      studentId: json['studentId'] ?? '',
      skill: SkillTypeExtension.fromString(json['skill'] ?? 'test'),
      score: (json['score'] as num?)?.toDouble() ?? 0.0,
      date: json['date'] is Timestamp
          ? (json['date'] as Timestamp).toDate()
          : (DateTime.tryParse(json['date']?.toString() ?? '') ?? DateTime.now()),
      comment: json['comment'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'studentId': studentId,
      'skill': skill.value,
      'score': score,
      'date': Timestamp.fromDate(date),
      'comment': comment,
    };
  }
}

// ==========================================
// 5. ASSIGNMENT MODEL (assignment_model.dart)
// ==========================================
class AssignmentSubmission {
  final String studentId;
  final String fileUrl;
  final String fileName;
  final DateTime submittedAt;
  final double? score;
  final String? teacherFeedback;

  AssignmentSubmission({
    required this.studentId,
    required this.fileUrl,
    required this.fileName,
    required this.submittedAt,
    this.score,
    this.teacherFeedback,
  });

  factory AssignmentSubmission.fromJson(Map<String, dynamic> json) {
    return AssignmentSubmission(
      studentId: json['studentId'] ?? '',
      fileUrl: json['fileUrl'] ?? '',
      fileName: json['fileName'] ?? 'submission.pdf',
      submittedAt: json['submittedAt'] is Timestamp
          ? (json['submittedAt'] as Timestamp).toDate()
          : (DateTime.tryParse(json['submittedAt']?.toString() ?? '') ?? DateTime.now()),
      score: (json['score'] as num?)?.toDouble(),
      teacherFeedback: json['teacherFeedback'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'studentId': studentId,
      'fileUrl': fileUrl,
      'fileName': fileName,
      'submittedAt': Timestamp.fromDate(submittedAt),
      'score': score,
      'teacherFeedback': teacherFeedback,
    };
  }
}

class AssignmentModel {
  final String id;
  final String classId;
  final String title;
  final String description;
  final String? fileUrl;
  final String? fileName;
  final DateTime dueDate;
  final List<AssignmentSubmission> submissions;

  AssignmentModel({
    required this.id,
    required this.classId,
    required this.title,
    required this.description,
    this.fileUrl,
    this.fileName,
    required this.dueDate,
    this.submissions = const [],
  });

  factory AssignmentModel.fromJson(Map<String, dynamic> json, [String? docId]) {
    return AssignmentModel(
      id: docId ?? json['id'] ?? '',
      classId: json['classId'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      fileUrl: json['fileUrl'],
      fileName: json['fileName'],
      dueDate: json['dueDate'] is Timestamp
          ? (json['dueDate'] as Timestamp).toDate()
          : (DateTime.tryParse(json['dueDate']?.toString() ?? '') ?? DateTime.now()),
      submissions: (json['submissions'] as List<dynamic>? ?? [])
          .map((sub) => AssignmentSubmission.fromJson(sub))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'classId': classId,
      'title': title,
      'description': description,
      'fileUrl': fileUrl,
      'fileName': fileName,
      'dueDate': Timestamp.fromDate(dueDate),
      'submissions': submissions.map((s) => s.toJson()).toList(),
    };
  }
}

// ==========================================
// 6. EVALUATION MODEL (evaluation_model.dart)
// ==========================================
enum EvaluationType { reward, praise, discipline }

extension EvaluationTypeExtension on EvaluationType {
  String get value => name;
  String get vietnameseLabel {
    switch (this) {
      case EvaluationType.reward: return 'Khen thưởng đặc biệt';
      case EvaluationType.praise: return 'Biểu dương / Tích cực';
      case EvaluationType.discipline: return 'Phê bình / Cần chấn chỉnh';
    }
  }

  static EvaluationType fromString(String val) {
    return EvaluationType.values.firstWhere(
      (e) => e.name.toLowerCase() == val.toLowerCase(),
      orElse: () => EvaluationType.praise,
    );
  }
}

class EvaluationModel {
  final String id;
  final String studentId;
  final String teacherNote;
  final EvaluationType type;
  final DateTime date;
  final String? teacherId;

  EvaluationModel({
    required this.id,
    required this.studentId,
    required this.teacherNote,
    required this.type,
    required this.date,
    this.teacherId,
  });

  factory EvaluationModel.fromJson(Map<String, dynamic> json, [String? docId]) {
    return EvaluationModel(
      id: docId ?? json['id'] ?? '',
      studentId: json['studentId'] ?? '',
      teacherNote: json['teacherNote'] ?? '',
      type: EvaluationTypeExtension.fromString(json['type'] ?? 'praise'),
      date: json['date'] is Timestamp
          ? (json['date'] as Timestamp).toDate()
          : (DateTime.tryParse(json['date']?.toString() ?? '') ?? DateTime.now()),
      teacherId: json['teacherId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'studentId': studentId,
      'teacherNote': teacherNote,
      'type': type.value,
      'date': Timestamp.fromDate(date),
      'teacherId': teacherId,
    };
  }
}

// ==========================================
// 7. CERTIFICATE MODEL (certificate_model.dart)
// ==========================================
class CertificateModel {
  final String id;
  final String studentId;
  final String certName;
  final String fileUrl;
  final DateTime issueDate;
  final String? certType;

  CertificateModel({
    required this.id,
    required this.studentId,
    required this.certName,
    required this.fileUrl,
    required this.issueDate,
    this.certType,
  });

  factory CertificateModel.fromJson(Map<String, dynamic> json, [String? docId]) {
    return CertificateModel(
      id: docId ?? json['id'] ?? '',
      studentId: json['studentId'] ?? '',
      certName: json['certName'] ?? '',
      fileUrl: json['fileUrl'] ?? '',
      issueDate: json['issueDate'] is Timestamp
          ? (json['issueDate'] as Timestamp).toDate()
          : (DateTime.tryParse(json['issueDate']?.toString() ?? '') ?? DateTime.now()),
      certType: json['certType'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'studentId': studentId,
      'certName': certName,
      'fileUrl': fileUrl,
      'issueDate': Timestamp.fromDate(issueDate),
      'certType': certType,
    };
  }
}

// ==========================================
// 8. LEADERBOARD MODEL (leaderboard_model.dart)
// ==========================================
class LeaderboardModel {
  final String id;
  final String classId;
  final String topStudentId;
  final String month; // '10/2026' or 'YYYY-MM'
  final double score;
  final String? highlightNote;

  LeaderboardModel({
    required this.id,
    required this.classId,
    required this.topStudentId,
    required this.month,
    required this.score,
    this.highlightNote,
  });

  factory LeaderboardModel.fromJson(Map<String, dynamic> json, [String? docId]) {
    return LeaderboardModel(
      id: docId ?? json['id'] ?? '',
      classId: json['classId'] ?? '',
      topStudentId: json['topStudentId'] ?? '',
      month: json['month'] ?? '',
      score: (json['score'] as num?)?.toDouble() ?? 0.0,
      highlightNote: json['highlightNote'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'classId': classId,
      'topStudentId': topStudentId,
      'month': month,
      'score': score,
      'highlightNote': highlightNote,
    };
  }
}
`;

export const FLUTTER_RIVERPOD_SERVICE_CODE = `// ============================================================
// STATE MANAGEMENT & CRUD SERVICES WITH RIVERPOD & FIRESTORE
// (lib/features/classes/data/class_repository.dart)
// ============================================================
import 'dart:io';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// --- FIRESTORE PROVIDERS ---
final firestoreProvider = Provider<FirebaseFirestore>((ref) => FirebaseFirestore.instance);
final storageProvider = Provider<FirebaseStorage>((ref) => FirebaseStorage.instance);

// --- CLASS REPOSITORY WITH MAX 15 CLASSES VALIDATION ---
class ClassRepository {
  final FirebaseFirestore _firestore;

  ClassRepository(this._firestore);

  CollectionReference<Map<String, dynamic>> get _classesRef =>
      _firestore.collection('classes');

  // 1. Lấy danh sách lớp học (tối đa 15 lớp)
  Stream<List<ClassModel>> watchClasses() {
    return _classesRef.limit(15).snapshots().map((snapshot) {
      return snapshot.docs
          .map((doc) => ClassModel.fromJson(doc.data(), doc.id))
          .toList();
    });
  }

  // 2. Thêm lớp mới (Kiểm tra giới hạn tối đa 15 lớp)
  Future<void> createClass(ClassModel newClass) async {
    final countSnapshot = await _classesRef.count().get();
    if ((countSnapshot.count ?? 0) >= 15) {
      throw Exception('Trung tâm chỉ cho phép quản lý tối đa 15 lớp học!');
    }
    await _classesRef.doc(newClass.id.isEmpty ? null : newClass.id).set(newClass.toJson());
  }

  // 3. Thêm học viên vào lớp (Admin CRUD)
  Future<void> addStudentToClass({
    required String classId,
    required String studentId,
  }) async {
    final batch = _firestore.batch();
    
    // Thêm studentId vào mảng studentList của lớp
    final classDoc = _classesRef.doc(classId);
    batch.update(classDoc, {
      'studentList': FieldValue.arrayUnion([studentId])
    });

    // Cập nhật classId cho UserModel
    final userDoc = _firestore.collection('users').doc(studentId);
    batch.update(userDoc, {'classId': classId});

    await batch.commit();
  }

  // 4. Xóa học viên khỏi lớp (Admin CRUD)
  Future<void> removeStudentFromClass({
    required String classId,
    required String studentId,
  }) async {
    final batch = _firestore.batch();

    final classDoc = _classesRef.doc(classId);
    batch.update(classDoc, {
      'studentList': FieldValue.arrayRemove([studentId])
    });

    final userDoc = _firestore.collection('users').doc(studentId);
    batch.update(userDoc, {'classId': FieldValue.delete()});

    await batch.commit();
  }
}

// --- ATTENDANCE REPOSITORY ---
class AttendanceRepository {
  final FirebaseFirestore _firestore;

  AttendanceRepository(this._firestore);

  // 1. Lưu điểm danh đơn lẻ
  Future<void> saveAttendance(AttendanceModel attendance) async {
    final docId = '\${attendance.classId}_\${attendance.studentId}_\${attendance.date.toIso8601String().substring(0, 10)}';
    await _firestore
        .collection('attendance')
        .doc(docId)
        .set(attendance.toJson(), SetOptions(merge: true));
  }

  // 2. Điểm danh hàng loạt (Batch) cho cả lớp theo ngày với ghi chú
  Future<void> saveBatchAttendance(List<AttendanceModel> attendanceList) async {
    final batch = _firestore.batch();
    for (final item in attendanceList) {
      final dateKey = item.date.toIso8601String().substring(0, 10);
      final docRef = _firestore
          .collection('attendance')
          .doc('\${item.classId}_\${item.studentId}_\$dateKey');
      batch.set(docRef, item.toJson(), SetOptions(merge: true));
    }
    await batch.commit();
  }

  // 3. Lấy dữ liệu điểm danh theo lớp và ngày
  Stream<List<AttendanceModel>> watchDailyAttendance({
    required String classId,
    required DateTime date,
  }) {
    final startOfDay = DateTime(date.year, date.month, date.day);
    final endOfDay = DateTime(date.year, date.month, date.day, 23, 59, 59);

    return _firestore
        .collection('attendance')
        .where('classId', isEqualTo: classId)
        .where('date', isGreaterThanOrEqualTo: Timestamp.fromDate(startOfDay))
        .where('date', isLessThanOrEqualTo: Timestamp.fromDate(endOfDay))
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => AttendanceModel.fromJson(doc.data(), doc.id))
            .toList());
  }
}

// --- CERTIFICATE REPOSITORY ---
class CertificateRepository {
  final FirebaseFirestore _firestore;
  final FirebaseStorage _storage;

  CertificateRepository(this._firestore, this._storage);

  // Upload file chứng chỉ (PDF/Ảnh) lên Firebase Storage & lưu metadata vào Firestore
  Future<CertificateModel> uploadCertificate({
    required String studentId,
    required String certName,
    required File file,
    String? certType,
  }) async {
    final fileName = '\${DateTime.now().millisecondsSinceEpoch}_\${file.path.split('/').last}';
    final ref = _storage.ref().child('certificates/\$studentId/\$fileName');
    
    // Upload file
    final uploadTask = await ref.putFile(file);
    final downloadUrl = await uploadTask.ref.getDownloadURL();

    // Lưu vào Firestore
    final docRef = _firestore.collection('certificates').doc();
    final newCert = CertificateModel(
      id: docRef.id,
      studentId: studentId,
      certName: certName,
      fileUrl: downloadUrl,
      issueDate: DateTime.now(),
      certType: certType,
    );

    await docRef.set(newCert.toJson());
    return newCert;
  }

  // Lấy danh sách chứng chỉ của học viên
  Stream<List<CertificateModel>> watchStudentCertificates(String studentId) {
    return _firestore
        .collection('certificates')
        .where('studentId', isEqualTo: studentId)
        .orderBy('issueDate', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => CertificateModel.fromJson(doc.data(), doc.id))
            .toList());
  }
}

// --- RIVERPOD STATE NOTIFIERS ---
final classRepositoryProvider = Provider((ref) => ClassRepository(ref.watch(firestoreProvider)));
final attendanceRepositoryProvider = Provider((ref) => AttendanceRepository(ref.watch(firestoreProvider)));
final certificateRepositoryProvider = Provider((ref) => CertificateRepository(ref.watch(firestoreProvider), ref.watch(storageProvider)));

// StateNotifier quản lý danh sách lớp
class ClassController extends StateNotifier<AsyncValue<List<ClassModel>>> {
  final ClassRepository _repository;

  ClassController(this._repository) : super(const AsyncValue.loading()) {
    _listenToClasses();
  }

  void _listenToClasses() {
    _repository.watchClasses().listen(
      (classes) => state = AsyncValue.data(classes),
      onError: (err, stack) => state = AsyncValue.error(err, stack),
    );
  }

  Future<void> addStudent(String classId, String studentId) async {
    await _repository.addStudentToClass(classId: classId, studentId: studentId);
  }

  Future<void> removeStudent(String classId, String studentId) async {
    await _repository.removeStudentFromClass(classId: classId, studentId: studentId);
  }
}

final classControllerProvider = StateNotifierProvider<ClassController, AsyncValue<List<ClassModel>>>((ref) {
  return ClassController(ref.watch(classRepositoryProvider));
});
`;

export const FLUTTER_PROVIDER_CODE = `// ============================================================
// ALTERNATIVE: STATE MANAGEMENT VỚI PROVIDER (ChangeNotifier)
// ============================================================
import 'package:flutter/foundation.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class ClassProvider with ChangeNotifier {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  List<ClassModel> _classes = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<ClassModel> get classes => _classes;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Lấy danh sách lớp
  Future<void> fetchClasses() async {
    _isLoading = true;
    notifyListeners();

    try {
      final snapshot = await _firestore.collection('classes').limit(15).get();
      _classes = snapshot.docs
          .map((doc) => ClassModel.fromJson(doc.data(), doc.id))
          .toList();
      _errorMessage = null;
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Thêm học viên vào lớp
  Future<bool> addStudentToClass(String classId, String studentId) async {
    try {
      final classDoc = _firestore.collection('classes').doc(classId);
      await classDoc.update({
        'studentList': FieldValue.arrayUnion([studentId])
      });

      // Cập nhật local state
      final index = _classes.indexWhere((c) => c.id == classId);
      if (index != -1 && !_classes[index].studentList.contains(studentId)) {
        _classes[index].studentList.add(studentId);
        notifyListeners();
      }
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Bớt học viên khỏi lớp
  Future<bool> removeStudentFromClass(String classId, String studentId) async {
    try {
      final classDoc = _firestore.collection('classes').doc(classId);
      await classDoc.update({
        'studentList': FieldValue.arrayRemove([studentId])
      });

      final index = _classes.indexWhere((c) => c.id == classId);
      if (index != -1) {
        _classes[index].studentList.remove(studentId);
        notifyListeners();
      }
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
`;

export const FLUTTER_FOLDER_STRUCTURE = `my_english_center_app/
│
├── android/
├── ios/
├── web/
│
├── lib/
│   ├── main.dart                          # App Entry point, Firebase.initializeApp()
│   ├── app.dart                           # MaterialApp, GoRouter config, Theme setup
│   │
│   ├── core/                              # Mã dùng chung xuyên suốt app
│   │   ├── constants/
│   │   │   ├── app_colors.dart            # Bảng màu chuẩn LookEnglish (Navy, Gold, Coral)
│   │   │   └── app_constants.dart         # Max 15 classes constraint, API keys
│   │   ├── network/
│   │   │   └── api_client.dart
│   │   ├── utils/
│   │   │   ├── date_formatter.dart
│   │   │   └── file_picker_helper.dart    # Chọn file PDF / Ảnh chụp chứng chỉ
│   │   └── widgets/
│   │       ├── custom_button.dart
│   │       ├── loading_shimmer.dart
│   │       └── role_badge.dart
│   │
│   ├── features/                          # Feature-driven Architecture
│   │   │
│   │   ├── auth/                          # Đăng nhập & Phân quyền (Admin, Teacher, Student, Parent)
│   │   │   ├── data/models/user_model.dart
│   │   │   ├── data/repositories/auth_repository.dart
│   │   │   ├── presentation/controllers/auth_controller.dart
│   │   │   └── presentation/screens/login_screen.dart
│   │   │
│   │   ├── classes/                       # Quản lý tối đa 15 lớp học tiếng Anh & Xếp học viên
│   │   │   ├── data/models/class_model.dart
│   │   │   ├── data/repositories/class_repository.dart
│   │   │   ├── presentation/controllers/class_controller.dart
│   │   │   └── presentation/screens/
│   │   │       ├── class_list_screen.dart
│   │   │       └── class_detail_roster_screen.dart
│   │   │
│   │   ├── attendance/                    # Điểm danh hàng ngày & Ghi chú chi tiết
│   │   │   ├── data/models/attendance_model.dart
│   │   │   ├── data/repositories/attendance_repository.dart
│   │   │   └── presentation/screens/daily_attendance_screen.dart
│   │   │
│   │   ├── academic/                      # Bảng điểm 4 kỹ năng & Bài tập về nhà
│   │   │   ├── data/models/
│   │   │   │   ├── grade_model.dart
│   │   │   │   └── assignment_model.dart
│   │   │   ├── data/repositories/academic_repository.dart
│   │   │   └── presentation/screens/
│   │   │       ├── grade_entry_screen.dart
│   │   │       ├── student_grade_chart_screen.dart
│   │   │       └── homework_submission_screen.dart
│   │   │
│   │   ├── evaluation/                    # Khen thưởng & Phê bình học viên
│   │   │   ├── data/models/evaluation_model.dart
│   │   │   └── presentation/screens/student_evaluation_screen.dart
│   │   │
│   │   ├── certificates/                  # Kho chứng chỉ (PDF/Ảnh) của học viên
│   │   │   ├── data/models/certificate_model.dart
│   │   │   ├── data/repositories/certificate_repository.dart
│   │   │   └── presentation/screens/
│   │   │       ├── certificate_vault_screen.dart
│   │   │       └── pdf_viewer_screen.dart
│   │   │
│   │   ├── leaderboard/                   # Bảng vàng Top 1 xuất sắc hàng tháng
│   │   │   ├── data/models/leaderboard_model.dart
│   │   │   └── presentation/screens/monthly_top1_leaderboard_screen.dart
│   │   │
│   │   └── ai_chatbot/                    # Chatbot AI hỗ trợ Giáo viên, Học viên & Phụ huynh
│   │       ├── data/services/gemini_ai_service.dart
│   │       └── presentation/screens/ai_assistant_chat_screen.dart
│   │
│   └── routing/
│       └── app_router.dart                # Role-based Navigation Guard
│
└── pubspec.yaml                           # dependencies: flutter_riverpod, firebase_core, ...
`;
