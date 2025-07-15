import React, { useState, useRef } from "react";
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
  FiShield
} from "react-icons/fi";
import Modal from "react-modal";
import styles from "./ProfileSettings.module.css";

Modal.setAppElement("#root");

const sections = [
  { id: "general", label: "General", icon: <FiUser /> },
  { id: "security", label: "Security", icon: <FiLock /> },
  { id: "family", label: "Family", icon: <FiUsers /> },
];

const ProfileSettings = () => {
  const [activeSection, setActiveSection] = useState("general");
  const [formData, setFormData] = useState({
    profileImage: "https://i.pinimg.com/1200x/a0/e9/f8/a0e9f8f125872966759bb388697f238e.jpg",
    username: "Furkan ThecLifeN",
    handle: "furkan_theclifen",
    email: "furkan@example.com",
    phone: "+90 555 123 45 67",
    bio: "Yazılım, tasarım ve sistemin kesişim noktasındayım.",
    familyMembership: "aile_sistemi",
  });
  
  const [editField, setEditField] = useState(null);
  const [verificationStep, setVerificationStep] = useState(null);
  const [tempEmail, setTempEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [followedUsers, setFollowedUsers] = useState([
    { id: 1, name: "Ahmet Yılmaz", username: "ahmet_yilmaz", isFamily: true },
    { id: 2, name: "Mehmet Kaya", username: "mehmet.kaya", isFamily: false },
    { id: 3, name: "Ayşe Demir", username: "ayse.demir", isFamily: false },
  ]);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "handle") {
      // Only allow lowercase letters, numbers, dots and underscores
      const filteredValue = value.toLowerCase().replace(/[^a-z0-9._]/g, "");
      setFormData((prev) => ({ ...prev, [name]: filteredValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => fileInputRef.current.click();

  const startEdit = (field) => {
    setEditField(field);
    
    if (field === "email" || field === "phone" || field === "password") {
      setVerificationStep("request");
    }
  };

  const cancelEdit = () => {
    setEditField(null);
    setVerificationStep(null);
    setVerificationCode("");
    setTempEmail("");
  };

  const requestVerification = () => {
    // In a real app, this would send a code to the user's email/phone
    setVerificationStep("verify");
  };

  const verifyAndSave = () => {
    // In a real app, this would verify the code first
    if (editField === "email") {
      setFormData((prev) => ({ ...prev, email: tempEmail }));
    }
    
    setEditField(null);
    setVerificationStep(null);
    setVerificationCode("");
    setTempEmail("");
  };

  const toggleFamilyMember = (userId) => {
    setFollowedUsers(users => 
      users.map(user => 
        user.id === userId ? { ...user, isFamily: !user.isFamily } : user
      )
    );
  };

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        {sections.map((section) => (
          <button
            key={section.id}
            className={`${styles.sidebarItem} ${
              activeSection === section.id ? styles.active : ""
            }`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.icon}
            <span>{section.label}</span>
            <FiChevronRight className={styles.chevron} />
          </button>
        ))}
      </aside>

      <main className={styles.content}>
        <div className={styles.profileHeader}>
          <div className={styles.profilePicWrapper}>
            <img
              src={formData.profileImage}
              alt="Profile"
              className={styles.profileImage}
            />
            <button
              className={styles.uploadBtn}
              onClick={triggerImageUpload}
            >
              <FiCamera />
            </button>
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.username}>{formData.username}</h2>
            <p className={styles.handle}>@{formData.handle}</p>
            <p className={styles.bio}>{formData.bio}</p>
          </div>
        </div>

        <div className={styles.formSection}>
          {activeSection === "general" && (
            <>
              <Field
                label="Display Name"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onEdit={() => startEdit("username")}
                isEditing={editField === "username"}
                onCancel={cancelEdit}
                onSave={() => setEditField(null)}
              />
              
              <Field
                label="Username"
                name="handle"
                value={formData.handle}
                onChange={handleChange}
                onEdit={() => {
                  if (window.confirm("Changing your username may affect how others can find you. Continue?")) {
                    startEdit("handle");
                  }
                }}
                isEditing={editField === "handle"}
                onCancel={cancelEdit}
                onSave={() => setEditField(null)}
                prefix="@"
              />
              
              <Field
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                onEdit={() => startEdit("bio")}
                isEditing={editField === "bio"}
                onCancel={cancelEdit}
                onSave={() => setEditField(null)}
                textarea
              />
            </>
          )}

          {activeSection === "security" && (
            <>
              {editField === "email" ? (
                <div className={styles.verificationFlow}>
                  <div className={styles.securityHeader}>
                    <FiShield className={styles.securityIcon} />
                    <h3>Email Change Verification</h3>
                  </div>
                  
                  {verificationStep === "request" && (
                    <>
                      <p className={styles.verificationText}>Current email: {formData.email}</p>
                      
                      <div className={styles.formGroup}>
                        <label>New Email Address</label>
                        <input
                          type="email"
                          value={tempEmail}
                          onChange={(e) => setTempEmail(e.target.value)}
                          className={styles.inputField}
                        />
                      </div>
                      
                      <button 
                        className={styles.primaryButton}
                        onClick={requestVerification}
                      >
                        <FiSend /> Send Verification Code
                      </button>
                    </>
                  )}
                  
                  {verificationStep === "verify" && (
                    <>
                      <p className={styles.verificationText}>
                        We sent a verification code to {formData.email}
                      </p>
                      
                      <div className={styles.formGroup}>
                        <label>Verification Code</label>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className={styles.inputField}
                          placeholder="6-digit code"
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
                          onClick={verifyAndSave}
                        >
                          Confirm Email Change
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Field
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onEdit={() => startEdit("email")}
                  isEditing={false}
                />
              )}
              
              {editField === "password" ? (
                <div className={styles.verificationFlow}>
                  <div className={styles.securityHeader}>
                    <FiShield className={styles.securityIcon} />
                    <h3>Password Change</h3>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Current Password</label>
                    <input
                      type="password"
                      className={styles.inputField}
                      placeholder="Enter current password"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>New Password</label>
                    <input
                      type="password"
                      className={styles.inputField}
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      className={styles.inputField}
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <button 
                    className={styles.primaryButton}
                    onClick={() => {
                      setVerificationStep("verify");
                      requestVerification();
                    }}
                  >
                    <FiSend /> Send Verification Code
                  </button>
                  
                  {verificationStep === "verify" && (
                    <>
                      <div className={styles.formGroup}>
                        <label>Verification Code</label>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className={styles.inputField}
                          placeholder="6-digit code"
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
                          onClick={() => {
                            verifyAndSave();
                            setEditField(null);
                          }}
                        >
                          Confirm Password Change
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Field
                  label="Password"
                  name="password"
                  value="••••••••"
                  onChange={handleChange}
                  onEdit={() => startEdit("password")}
                  isEditing={false}
                  type="password"
                />
              )}
              
              <Field
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onEdit={() => startEdit("phone")}
                isEditing={editField === "phone"}
                onCancel={cancelEdit}
                onSave={() => {
                  setVerificationStep("request");
                  setIsModalOpen(true);
                }}
              />
            </>
          )}

          {activeSection === "family" && (
            <>
              <Field
                label="Family Group"
                name="familyMembership"
                value={formData.familyMembership}
                onChange={handleChange}
                onEdit={() => startEdit("familyMembership")}
                isEditing={editField === "familyMembership"}
                onCancel={cancelEdit}
                onSave={() => setEditField(null)}
              />
              
              <div className={styles.memberBox}>
                <div className={styles.memberHeader}>
                  <h4 className={styles.memberTitle}>Family Members</h4>
                  <button 
                    className={styles.addButton}
                    onClick={() => setIsFamilyModalOpen(true)}
                  >
                    <FiPlus /> Add Member
                  </button>
                </div>
                
                <div className={styles.memberCard}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberName}>Furkan ThecLifeN</div>
                    <div className={styles.memberRole}>Owner</div>
                  </div>
                </div>
                
                <div className={styles.memberCard}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberName}>Ahmet Yılmaz</div>
                    <div className={styles.memberRole}>Member</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Phone Verification Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <div className={styles.modalContent}>
          <div className={styles.securityHeader}>
            <FiShield className={styles.securityIcon} />
            <h3>Phone Verification</h3>
          </div>
          
          <p className={styles.verificationText}>
            We sent a verification code to {formData.phone}
          </p>
          
          <div className={styles.formGroup}>
            <label>Verification Code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className={styles.inputField}
              placeholder="6-digit code"
            />
          </div>
          
          <div className={styles.buttonGroup}>
            <button 
              className={styles.secondaryButton}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              className={styles.primaryButton}
              onClick={() => {
                verifyAndSave();
                setIsModalOpen(false);
                setEditField(null);
              }}
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
          <h3 className={styles.modalTitle}>Add Family Members</h3>
          <p className={styles.modalSubtitle}>Select from people you follow</p>
          
          <div className={styles.followedUsersList}>
            {followedUsers.map(user => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userInfo}>
                  <div className={styles.userInitial}>{user.name.charAt(0)}</div>
                  <div>
                    <div className={styles.userName}>{user.name}</div>
                    <div className={styles.userHandle}>@{user.username}</div>
                  </div>
                </div>
                <button
                  className={`${styles.familyToggle} ${user.isFamily ? styles.inFamily : ''}`}
                  onClick={() => toggleFamilyMember(user.id)}
                >
                  {user.isFamily ? 'Remove' : 'Add'}
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

const Field = ({ 
  label, 
  name, 
  value, 
  onChange, 
  onEdit, 
  onCancel, 
  onSave, 
  isEditing, 
  textarea, 
  type = "text",
  prefix
}) => (
  <div className={styles.field}>
    <label>{label}</label>
    
    {isEditing ? (
      <div className={styles.editMode}>
        {textarea ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            className={styles.textareaField}
          />
        ) : (
          <div className={styles.inputWrapper}>
            {prefix && <span className={styles.inputPrefix}>{prefix}</span>}
            <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              className={styles.inputField}
            />
          </div>
        )}
        
        <div className={styles.editActions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            <FiX />
          </button>
          <button className={styles.saveButton} onClick={onSave}>
            <FiCheck />
          </button>
        </div>
      </div>
    ) : (
      <div className={styles.viewMode}>
        {type === "password" ? (
          <span className={styles.passwordField}>••••••••</span>
        ) : (
          <span className={styles.fieldValue}>
            {prefix && <span className={styles.valuePrefix}>{prefix}</span>}
            {value}
          </span>
        )}
        <button className={styles.editButton} onClick={onEdit}>
          <FiEdit />
        </button>
      </div>
    )}
  </div>
);

export default ProfileSettings;