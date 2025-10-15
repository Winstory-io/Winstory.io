// Styles réutilisables pour les Dev Controls
export const devControlsStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#FFD600',
    margin: 0,
    paddingBottom: '12px',
    borderBottom: '1px solid #6B5A20'
  },
  
  subsectionTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#C0C0C0',
    margin: 0
  },
  
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  
  fieldContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#C0C0C0',
    marginBottom: '8px'
  },
  
  input: {
    width: '100%',
    padding: '12px',
    background: '#111',
    border: '1px solid #6B5A20',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  
  inputFocus: {
    borderColor: '#FFD600',
    boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.2)'
  },
  
  inputBlur: {
    borderColor: '#6B5A20',
    boxShadow: 'none'
  },
  
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#C0C0C0'
  },
  
  button: {
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    background: '#333',
    color: '#FFFFFF',
    border: '1px solid #6B5A20',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  
  buttonHover: {
    background: '#444',
    borderColor: '#FFD600'
  },
  
  buttonPrimary: {
    background: '#FFD600',
    color: '#000000',
    border: 'none'
  },
  
  buttonPrimaryHover: {
    background: '#FFE55C'
  },
  
  buttonDisabled: {
    background: '#666',
    color: '#999',
    cursor: 'not-allowed',
    opacity: 0.5
  }
};
