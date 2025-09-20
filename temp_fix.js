  const renderConditions = (data: ModerationData) => {
    // Logique corrigée pour la condition des modérateurs
    const totalVotes = data.validatedVotes + data.refusedVotes;
    const moderatorConditionMet = totalVotes >= 22;
    
    // Logique pour Pool Staking - si proche du seuil, afficher comme "en cours"
    const poolStakingProgress = (data.poolStaking / data.mintPrice) * 100;
    const isPoolStakingInProgress = poolStakingProgress >= 80 && poolStakingProgress < 100;
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#fff' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          padding: '16px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          border: isPoolStakingInProgress 
            ? '1px solid rgba(255, 214, 0, 0.3)' 
            : `1px solid ${data.conditions.poolStakingExceedsMint ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)'}`,
        }}>
          <span style={{ 
            color: isPoolStakingInProgress 
              ? '#FFD600' 
              : data.conditions.poolStakingExceedsMint ? '#00FF00' : '#FF0000',
            fontSize: '24px'
          }}>
            {isPoolStakingInProgress ? (
              <span style={{ 
                display: 'inline-block',
                animation: 'spin 1s linear infinite',
                fontSize: '20px'
              }}>
                ⏳
              </span>
            ) : data.conditions.poolStakingExceedsMint ? '✅' : '❌'}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 500 }}>
            Pool Staking ({data.poolStaking} SWINC) &gt; MINT Price
            {isPoolStakingInProgress && (
              <span style={{ 
                color: '#FFD600', 
                fontSize: '12px', 
                marginLeft: '8px',
                fontStyle: 'italic'
              }}>
                (in progress...)
              </span>
            )}
          </span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          padding: '16px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          border: `1px solid ${data.conditions.hybridRatioMet ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)'}`,
        }}>
          <span style={{ 
            color: data.conditions.hybridRatioMet ? '#00FF00' : '#FF0000',
            fontSize: '24px'
          }}>
            {data.conditions.hybridRatioMet ? '✅' : '❌'}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 500 }}>
            Majority ({Math.max(data.validatedVotes, data.refusedVotes)}) / Minority ({Math.min(data.validatedVotes, data.refusedVotes)}) ≥ 2
          </span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          padding: '16px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          border: `1px solid ${moderatorConditionMet ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)'}`,
        }}>
          <span style={{ 
            color: moderatorConditionMet ? '#00FF00' : '#FF0000',
            fontSize: '24px'
          }}>
            {moderatorConditionMet ? '✅' : '❌'}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 500 }}>
            You moderate ({data.userVote === 'valid' ? 'Valid' : data.userVote === 'refuse' ? 'Refuse' : 'Not voted'}) with {totalVotes} others Moderators / 22
          </span>
        </div>
      </div>
    );
  };
