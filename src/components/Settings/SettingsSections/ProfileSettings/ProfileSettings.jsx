 import { useState, useRef } from "react";
import {
  FiEdit,
  FiCamera,
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiUsers,
  FiChevronRight,
  FiPlus,
  FiCheck,
  FiX,
  FiSend,
  FiShield,
  FiChevronDown
} from "react-icons/fi";
import Modal from "react-modal";
import styles from "./ProfileSettings.module.css";

Modal.setAppElement("#root");

const ProfileSettings = () => {
  // State for active section
  const [activeSection, setActiveSection] = useState("general");
  
  // User data state
  const [profileData, setProfileData] = useState({
    profileImage: "https://i.pinimg.com/1200x/a0/e9/f8/a0e9f8f125872966759bb388697f238e.jpg",
    displayName: "Furkan ThecLifeN",
    username: "furkan_theclifen",
    email: "furkan@example.com",
    phone: "+90 555 123 45 67",
    bio: "Yazılım, tasarım ve sistemin kesişim noktasındayım.",
    familyGroup: "aile_sistemi",
    password: "••••••••"
  });
  
  // Form state
  const [editField, setEditField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [verificationStep, setVerificationStep] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  
  // Modal states
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  
  // Family members data
  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, name: "Ahmet Yılmaz", username: "ahmet_yilmaz", isMember: true },
    { id: 2, name: "Mehmet Kaya", username: "mehmet.kaya", isMember: false },
    { id: 3, name: "Ayşe Demir", username: "ayse.demir", isMember: false },
  ]);
  
  const fileInputRef = useRef(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input
  const triggerImageUpload = () => fileInputRef.current.click();

  // Start editing a field
  const startEdit = (field) => {
    setEditField(field);
    setTempValue(profileData[field]);
    
    if (["email", "phone", "password"].includes(field)) {
      setVerificationStep("request");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditField(null);
    setTempValue("");
    setVerificationStep(null);
    setVerificationCode("");
  };

  // Save edited field
  const saveEdit = () => {
    if (editField) {
      setProfileData(prev => ({ ...prev, [editField]: tempValue }));
      
      if (editField === "phone") {
        setIsPhoneModalOpen(true);
      }
      
      setEditField(null);
      setTempValue("");
    }
  };

  // Request verification code
  const requestVerification = () => {
    // In a real app, this would send a code to the user's email/phone
    setVerificationStep("verify");
  };

  // Verify and complete sensitive changes
  const verifyAndComplete = () => {
    // In a real app, this would verify the code first
    if (editField === "email") {
      setProfileData(prev => ({ ...prev, email: tempValue }));
    }
    
    setEditField(null);
    setVerificationStep(null);
    setVerificationCode("");
    setTempValue("");
    setIsPhoneModalOpen(false);
  };

  // Toggle family member status
  const toggleFamilyMember = (id) => {
    setFamilyMembers(prev => 
      prev.map(member => 
        member.id === id ? { ...member, isMember: !member.isMember } : member
      )
    );
  };

  // Sections for navigation
  const sections = [
    { id: "general", label: "General", icon: <FiUser /> },
    { id: "security", label: "Security", icon: <FiLock /> },
    { id: "family", label: "Family", icon: <FiUsers /> },
  ];

  return (
    <div className={styles.container}>
      {/* Navigation Sidebar */}
      <nav className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3 className={styles.sidebarTitle}>Account Settings</h3>
        </div>
        
        <ul className={styles.sidebarNav}>
          {sections.map(section => (
            <li key={section.id}>
              <button
                className={`${styles.sidebarButton} ${activeSection === section.id ? styles.active : ""}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className={styles.sidebarIcon}>{section.icon}</span>
                <span className={styles.sidebarLabel}>{section.label}</span>
                <FiChevronRight className={styles.sidebarArrow} />
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className={styles.content}>
        {/* Profile Header */}
        <header className={styles.profileHeader}>
          <div className={styles.avatarContainer}>
            <img 
              src={profileData.profileImage} 
              alt="Profile" 
              className={styles.avatar}
            />
            <button 
              className={styles.avatarEdit}
              onClick={triggerImageUpload}
            >
              <FiCamera />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className={styles.fileInput}
            />
          </div>
          
          <div className={styles.profileInfo}>
            <h1 className={styles.displayName}>{profileData.displayName}</h1>
            <p className={styles.username}>@{profileData.username}</p>
            <p className={styles.bio}>{profileData.bio}</p>
          </div>
        </header>

        {/* Form Sections */}
        <section className={styles.formSection}>
          {/* General Section */}
          {activeSection === "general" && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Display Name</label>
                {editField === "displayName" ? (
                  <div className={styles.editContainer}>
                    <input
                      type="text"
                      name="displayName"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className={styles.formInput}
                      autoFocus
                    />
                    <div className={styles.editActions}>
                      <button 
                        type="button"
                        className={styles.cancelButton}
                        onClick={cancelEdit}
                      >
                        <FiX />
                      </button>
                      <button 
                        type="button"
                        className={styles.saveButton}
                        onClick={saveEdit}
                      >
                        <FiCheck />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.viewContainer}>
                    <p className={styles.fieldValue}>{profileData.displayName}</p>
                    <button 
                      className={styles.editButton}
                      onClick={() => startEdit("displayName")}
                    >
                      <FiEdit />
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Username</label>
                {editField === "username" ? (
                  <div className={styles.editContainer}>
                    <div className={styles.inputPrefix}>@</div>
                    <input
                      type="text"
                      name="username"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""))}
                      className={`${styles.formInput} ${styles.withPrefix}`}
                      autoFocus
                    />
                    <div className={styles.editActions}>
                      <button 
                        type="button"
                        className={styles.cancelButton}
                        onClick={cancelEdit}
                      >
                        <FiX />
                      </button>
                      <button 
                        type="button"
                        className={styles.saveButton}
                        onClick={saveEdit}
                      >
                        <FiCheck />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.viewContainer}>
                    <p className={styles.fieldValue}>@{profileData.username}</p>
                    <button 
                      className={styles.editButton}
                      onClick={() => {
                        if (window.confirm("Changing your username may affect how others can find you. Continue?")) {
                          startEdit("username");
                        }
                      }}
                    >
                      <FiEdit />
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Bio</label>
                {editField === "bio" ? (
                  <div className={styles.editContainer}>
                    <textarea
                      name="bio"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className={styles.formTextarea}
                      rows="4"
                      autoFocus
                    />
                    <div className={styles.editActions}>
                      <button 
                        type="button"
                        className={styles.cancelButton}
                        onClick={cancelEdit}
                      >
                        <FiX />
                      </button>
                      <button 
                        type="button"
                        className={styles.saveButton}
                        onClick={saveEdit}
                      >
                        <FiCheck />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.viewContainer}>
                    <p className={styles.fieldValue}>{profileData.bio || "No bio yet"}</p>
                    <button 
                      className={styles.editButton}
                      onClick={() => startEdit("bio")}
                    >
                      <FiEdit />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <>
              {editField === "email" ? (
                <div className={styles.securityFlow}>
                  <div className={styles.securityHeader}>
                    <FiShield className={styles.securityIcon} />
                    <h3>Email Change Verification</h3>
                  </div>
                  
                  {verificationStep === "request" ? (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Current Email</label>
                        <p className={styles.fieldValue}>{profileData.email}</p>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>New Email</label>
                        <input
                          type="email"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className={styles.formInput}
                          placeholder="Enter new email address"
                        />
                      </div>
                      
                      <button 
                        className={styles.primaryButton}
                        onClick={requestVerification}
                      >
                        <FiSend /> Send Verification Code
                      </button>
                    </>
                  ) : (
                    <>
                      <p className={styles.verificationText}>
                        We sent a 6-digit verification code to {profileData.email}
                      </p>
                      
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Verification Code</label>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className={styles.formInput}
                          placeholder="Enter 6-digit code"
                          maxLength="6"
                        />
                      </div>
                      
                      <div className={styles.buttonGroup}>
                        <button 
                          className={styles.secondaryButton}
                          onClick={() => setVerificationStep("request")}
                        >
                          Back
                        </button>
                        <button 
                          className={styles.primaryButton}
                          onClick={verifyAndComplete}
                          disabled={verificationCode.length !== 6}
                        >
                          Confirm Email Change
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <div className={styles.viewContainer}>
                    <p className={styles.fieldValue}>{profileData.email}</p>
                    <button 
                      className={styles.editButton}
                      onClick={() => startEdit("email")}
                    >
                      <FiEdit />
                    </button>
                  </div>
                </div>
              )}

              {editField === "password" ? (
                <div className={styles.securityFlow}>
                  <div className={styles.securityHeader}>
                    <FiShield className={styles.securityIcon} />
                    <h3>Change Password</h3>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Current Password</label>
                    <input
                      type="password"
                      className={styles.formInput}
                      placeholder="Enter your current password"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>New Password</label>
                    <input
                      type="password"
                      className={styles.formInput}
                      placeholder="Enter your new password"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Confirm New Password</label>
                    <input
                      type="password"
                      className={styles.formInput}
                      placeholder="Confirm your new password"
                    />
                  </div>
                  
                  <button 
                    className={styles.primaryButton}
                    onClick={requestVerification}
                  >
                    <FiSend /> Send Verification Code
                  </button>
                  
                  {verificationStep === "verify" && (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Verification Code</label>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className={styles.formInput}
                          placeholder="Enter 6-digit code"
                          maxLength="6"
                        />
                      </div>
                      
                      <div className={styles.buttonGroup}>
                        <button 
                          className={styles.secondaryButton}
                          onClick={() => setVerificationStep(null)}
                        >
                          Cancel
                        </button>
                        <button 
                          className={styles.primaryButton}
                          onClick={() => {
                            verifyAndComplete();
                            setEditField(null);
                          }}
                          disabled={verificationCode.length !== 6}
                        >
                          Confirm Password Change
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Password</label>
                  <div className={styles.viewContainer}>
                    <p className={styles.fieldValue}>••••••••</p>
                    <button 
                      className={styles.editButton}
                      onClick={() => startEdit("password")}
                    >
                      <FiEdit />
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                {editField === "phone" ? (
                  <div className={styles.editContainer}>
                    <input
                      type="tel"
                      name="phone"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className={styles.formInput}
                      autoFocus
                    />
                    <div className={styles.editActions}>
                      <button 
                        type="button"
                        className={styles.cancelButton}
                        onClick={cancelEdit}
                      >
                        <FiX />
                      </button>
                      <button 
                        type="button"
                        className={styles.saveButton}
                        onClick={() => {
                          saveEdit();
                          setIsPhoneModalOpen(true);
                        }}
                      >
                        <FiCheck />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.viewContainer}>
                    <p className={styles.fieldValue}>{profileData.phone}</p>
                    <button 
                      className={styles.editButton}
                      onClick={() => startEdit("phone")}
                    >
                      <FiEdit />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Family Section */}
          {activeSection === "family" && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Family Group</label>
                {editField === "familyGroup" ? (
                  <div className={styles.editContainer}>
                    <select
                      name="familyGroup"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className={styles.formSelect}
                      autoFocus
                    >
                      <option value="aile_sistemi">Aile Sistemi</option>
                      <option value="arkadas_grubu">Arkadaş Grubu</option>
                      <option value="is_ekibi">İş Ekibi</option>
                    </select>
                    <div className={styles.editActions}>
                      <button 
                        type="button"
                        className={styles.cancelButton}
                        onClick={cancelEdit}
                      >
                        <FiX />
                      </button>
                      <button 
                        type="button"
                        className={styles.saveButton}
                        onClick={saveEdit}
                      >
                        <FiCheck />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.viewContainer}>
                    <p className={styles.fieldValue}>{profileData.familyGroup}</p>
                    <button 
                      className={styles.editButton}
                      onClick={() => startEdit("familyGroup")}
                    >
                      <FiEdit />
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.membersSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Family Members</h3>
                  <button 
                    className={styles.addButton}
                    onClick={() => setIsFamilyModalOpen(true)}
                  >
                    <FiPlus /> Add Member
                  </button>
                </div>
                
                <div className={styles.membersList}>
                  <div className={styles.memberCard}>
                    <div className={styles.memberAvatar}>
                      {profileData.displayName.charAt(0)}
                    </div>
                    <div className={styles.memberInfo}>
                      <h4 className={styles.memberName}>{profileData.displayName}</h4>
                      <p className={styles.memberRole}>Owner</p>
                    </div>
                  </div>
                  
                  {familyMembers.filter(m => m.isMember).map(member => (
                    <div key={member.id} className={styles.memberCard}>
                      <div className={styles.memberAvatar}>
                        {member.name.charAt(0)}
                      </div>
                      <div className={styles.memberInfo}>
                        <h4 className={styles.memberName}>{member.name}</h4>
                        <p className={styles.memberRole}>Member</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {/* Phone Verification Modal */}
      <Modal
        isOpen={isPhoneModalOpen}
        onRequestClose={() => setIsPhoneModalOpen(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <FiShield className={styles.modalIcon} />
            <h3>Phone Verification</h3>
          </div>
          
          <p className={styles.modalText}>
            We've sent a 6-digit verification code to {profileData.phone}
          </p>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Verification Code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className={styles.formInput}
              placeholder="Enter 6-digit code"
              maxLength="6"
            />
          </div>
          
          <div className={styles.modalActions}>
            <button 
              className={styles.secondaryButton}
              onClick={() => setIsPhoneModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              className={styles.primaryButton}
              onClick={verifyAndComplete}
              disabled={verificationCode.length !== 6}
            >
              Verify Phone Number
            </button>
          </div>
        </div>
      </Modal>

      {/* Family Members Modal */}
      <Modal
        isOpen={isFamilyModalOpen}
        onRequestClose={() => setIsFamilyModalOpen(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <FiUsers className={styles.modalIcon} />
            <h3>Add Family Members</h3>
          </div>
          
          <p className={styles.modalText}>
            Select from people you follow to add to your family group
          </p>
          
          <div className={styles.followedUsers}>
            {familyMembers.map(user => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userAvatar}>
                  {user.name.charAt(0)}
                </div>
                <div className={styles.userInfo}>
                  <h4 className={styles.userName}>{user.name}</h4>
                  <p className={styles.userHandle}>@{user.username}</p>
                </div>
                <button
                  className={`${styles.userToggle} ${user.isMember ? styles.isMember : ''}`}
                  onClick={() => toggleFamilyMember(user.id)}
                >
                  {user.isMember ? 'Remove' : 'Add'}
                </button>
              </div>
            ))}
          </div>
          
          <div className={styles.modalActions}>
            <button 
              className={styles.secondaryButton}
              onClick={() => setIsFamilyModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              className={styles.primaryButton}
              onClick={() => setIsFamilyModalOpen(false)}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfileSettings;