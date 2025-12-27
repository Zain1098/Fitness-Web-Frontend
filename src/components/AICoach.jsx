import { useEffect, useRef, useState } from 'react'
import { Pose } from '@mediapipe/pose'
import { Camera } from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { POSE_CONNECTIONS } from '@mediapipe/pose'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import './AICoach.css'

export default function AICoach({ exercise, onClose, workoutId, onComplete }) {
  const { token } = useAuth()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reps, setReps] = useState(0)
  const [formScore, setFormScore] = useState(100)
  const [feedback, setFeedback] = useState('Get ready...')
  const [isActive, setIsActive] = useState(false)
  const [timer, setTimer] = useState(0)
  const [calories, setCalories] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const poseRef = useRef(null)
  const cameraRef = useRef(null)
  const lastPositionRef = useRef(null)
  const repStateRef = useRef('up')
  const timerIntervalRef = useRef(null)
  const targetReps = exercise?.reps || 10

  const exerciseName = exercise?.name || 'Exercise'

  useEffect(() => {
    // Reset state when exercise changes
    setReps(0)
    setFormScore(100)
    setFeedback('Get ready...')
    setIsCompleted(false)
    setTimer(0)
    setCalories(0)
    repStateRef.current = 'up'
    lastPositionRef.current = null
    
    initializePose()
    timerIntervalRef.current = setInterval(() => {
      setTimer(prev => prev + 1)
      setCalories(prev => prev + 0.1)
    }, 1000)
    
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop()
      }
      if (poseRef.current) {
        poseRef.current.close()
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [exerciseName])

  useEffect(() => {
    if (reps >= targetReps && !isCompleted) {
      setIsCompleted(true)
      setFeedback('✅ Exercise Complete! Great job!')
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      // Auto-complete set in parent
      if (onComplete) {
        setTimeout(() => {
          onComplete(reps)
          onClose()
        }, 1500)
      }
    }
  }, [reps, targetReps, isCompleted, onComplete, onClose])



  const initializePose = async () => {
    try {
      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      })

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      pose.onResults(onPoseResults)
      poseRef.current = pose

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (poseRef.current && videoRef.current) {
              await poseRef.current.send({ image: videoRef.current })
            }
          },
          width: 640,
          height: 480
        })
        await camera.start()
        cameraRef.current = camera
        setIsLoading(false)
        setIsActive(true)
        setFeedback('Start your exercise!')
      }
    } catch (error) {
      console.error('Pose initialization error:', error)
      setFeedback('Camera access denied or not available')
      setIsLoading(false)
    }
  }

  const onPoseResults = (results) => {
    if (!canvasRef.current || !results.poseLandmarks) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight

    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#ff6b35', lineWidth: 4 })
    drawLandmarks(ctx, results.poseLandmarks, { color: '#14e1ff', lineWidth: 2, radius: 6 })

    ctx.restore()

    if (!isCompleted) {
      analyzeExercise(results.poseLandmarks)
    }
  }

  const analyzeExercise = (landmarks) => {
    if (!landmarks || landmarks.length < 33) return

    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftElbow = landmarks[13]
    const rightElbow = landmarks[14]
    const leftWrist = landmarks[15]
    const rightWrist = landmarks[16]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]

    const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist)
    const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist)
    const leftLegAngle = calculateAngle(leftHip, leftKnee, leftAnkle)
    const rightLegAngle = calculateAngle(rightHip, rightKnee, rightAnkle)
    const torsoAngle = calculateAngle(leftShoulder, leftHip, leftKnee)

    const avgArmAngle = (leftArmAngle + rightArmAngle) / 2
    const avgLegAngle = (leftLegAngle + rightLegAngle) / 2

    const exerciseLower = (exerciseName || '').toLowerCase()
    
    // Advanced exercise-specific detection
    if (exerciseLower.includes('squat')) {
      analyzeSquatAdvanced(avgLegAngle, torsoAngle, leftHip, rightHip, leftKnee, rightKnee)
    } else if (exerciseLower.includes('push') || exerciseLower.includes('press')) {
      analyzePushPressAdvanced(avgArmAngle, leftShoulder, rightShoulder, leftElbow, rightElbow)
    } else if (exerciseLower.includes('curl')) {
      analyzeCurlAdvanced(avgArmAngle, leftElbow, rightElbow, leftShoulder, rightShoulder)
    } else if (exerciseLower.includes('lunge')) {
      analyzeLungeAdvanced(leftLegAngle, rightLegAngle, torsoAngle)
    } else if (exerciseLower.includes('deadlift')) {
      analyzeDeadliftAdvanced(torsoAngle, leftLegAngle, rightLegAngle)
    } else if (exerciseLower.includes('row')) {
      analyzeRowAdvanced(avgArmAngle, torsoAngle, leftElbow, rightElbow)
    } else {
      countRepsGeneric(avgArmAngle, avgLegAngle)
      analyzeGenericForm(avgArmAngle, avgLegAngle)
    }

    updateFormScore(avgArmAngle, avgLegAngle, torsoAngle)
  }

  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
    let angle = Math.abs(radians * 180.0 / Math.PI)
    if (angle > 180.0) angle = 360 - angle
    return angle
  }

  const countRepsLeg = (angle) => {
    if (angle < 100 && repStateRef.current === 'up') {
      repStateRef.current = 'down'
      setFeedback('⬇️ Going down...')
    } else if (angle > 160 && repStateRef.current === 'down') {
      repStateRef.current = 'up'
      setReps(prev => prev + 1)
      setFeedback('✅ Rep counted! Keep going!')
    }
  }

  const countRepsArm = (angle) => {
    if (angle < 90 && repStateRef.current === 'up') {
      repStateRef.current = 'down'
      setFeedback('⬇️ Lowering...')
    } else if (angle > 160 && repStateRef.current === 'down') {
      repStateRef.current = 'up'
      setReps(prev => prev + 1)
      setFeedback('✅ Rep counted! Nice!')
    }
  }

  const countRepsGeneric = (armAngle, legAngle) => {
    const movement = Math.abs(armAngle - (lastPositionRef.current?.armAngle || armAngle))
    if (movement > 30) {
      if (repStateRef.current === 'up') {
        repStateRef.current = 'down'
        setFeedback('⬇️ Movement detected...')
      } else {
        repStateRef.current = 'up'
        setReps(prev => prev + 1)
        setFeedback('✅ Rep counted!')
      }
    }
    lastPositionRef.current = { armAngle, legAngle }
  }

  const analyzeSquatAdvanced = (legAngle, torsoAngle, leftHip, rightHip, leftKnee, rightKnee) => {
    // Check depth
    if (legAngle < 90 && repStateRef.current === 'up') {
      repStateRef.current = 'down'
      // Check form during descent
      if (torsoAngle < 45) {
        setFeedback('❌ Keep chest up! Don\'t lean forward')
      } else if (Math.abs(leftHip.y - rightHip.y) > 0.05) {
        setFeedback('⚠️ Keep hips level')
      } else {
        setFeedback('✅ Good depth! Now push up')
      }
    } else if (legAngle > 160 && repStateRef.current === 'down') {
      repStateRef.current = 'up'
      setReps(prev => prev + 1)
      setFeedback('✅ Rep counted! Excellent form!')
    } else if (repStateRef.current === 'down') {
      if (legAngle > 120) {
        setFeedback('⬇️ Go lower - thighs parallel to ground')
      } else if (torsoAngle < 45) {
        setFeedback('❌ Chest up! Keep back straight')
      }
    }
  }

  const analyzePushPressAdvanced = (armAngle, leftShoulder, rightShoulder, leftElbow, rightElbow) => {
    if (armAngle < 90 && repStateRef.current === 'up') {
      repStateRef.current = 'down'
      // Check elbow alignment
      if (Math.abs(leftElbow.y - rightElbow.y) > 0.08) {
        setFeedback('⚠️ Keep elbows level')
      } else {
        setFeedback('⬇️ Good descent, control it')
      }
    } else if (armAngle > 160 && repStateRef.current === 'down') {
      repStateRef.current = 'up'
      setReps(prev => prev + 1)
      setFeedback('✅ Rep counted! Strong push!')
    } else if (repStateRef.current === 'down') {
      if (armAngle > 120) {
        setFeedback('⬇️ Lower more - 90 degree elbows')
      } else if (Math.abs(leftShoulder.y - rightShoulder.y) > 0.05) {
        setFeedback('❌ Keep shoulders level')
      }
    }
  }

  const analyzeCurlAdvanced = (armAngle, leftElbow, rightElbow, leftShoulder, rightShoulder) => {
    if (armAngle < 50 && repStateRef.current === 'up') {
      repStateRef.current = 'down'
      // Check if elbows are stable
      if (Math.abs(leftElbow.y - leftShoulder.y) < 0.15) {
        setFeedback('❌ Don\'t swing! Keep elbows back')
      } else {
        setFeedback('✅ Full contraction! Squeeze it')
      }
    } else if (armAngle > 160 && repStateRef.current === 'down') {
      repStateRef.current = 'up'
      setReps(prev => prev + 1)
      setFeedback('✅ Rep counted! Controlled!')
    } else if (repStateRef.current === 'up' && armAngle > 60) {
      setFeedback('⬆️ Curl up more - full range')
    } else if (repStateRef.current === 'down' && armAngle < 140) {
      setFeedback('⬇️ Lower slowly - control it')
    }
  }

  const analyzeLungeAdvanced = (leftLegAngle, rightLegAngle, torsoAngle) => {
    const frontLegAngle = Math.min(leftLegAngle, rightLegAngle)
    if (frontLegAngle < 100 && repStateRef.current === 'up') {
      repStateRef.current = 'down'
      if (torsoAngle < 60) {
        setFeedback('❌ Keep torso upright!')
      } else {
        setFeedback('⬇️ Good depth, knee at 90°')
      }
    } else if (frontLegAngle > 160 && repStateRef.current === 'down') {
      repStateRef.current = 'up'
      setReps(prev => prev + 1)
      setFeedback('✅ Rep counted! Perfect lunge!')
    }
  }

  const analyzeDeadliftAdvanced = (torsoAngle, leftLegAngle, rightLegAngle) => {
    const avgLegAngle = (leftLegAngle + rightLegAngle) / 2
    if (torsoAngle < 45 && repStateRef.current === 'up') {
      repStateRef.current = 'down'
      if (avgLegAngle > 140) {
        setFeedback('❌ Bend knees more - use legs!')
      } else {
        setFeedback('⬇️ Hinge at hips, back straight')
      }
    } else if (torsoAngle > 80 && repStateRef.current === 'down') {
      repStateRef.current = 'up'
      setReps(prev => prev + 1)
      setFeedback('✅ Rep counted! Strong lift!')
    }
  }

  const analyzeRowAdvanced = (armAngle, torsoAngle, leftElbow, rightElbow) => {
    if (armAngle < 60 && repStateRef.current === 'up') {
      repStateRef.current = 'down'
      if (torsoAngle < 30) {
        setFeedback('❌ Keep torso stable - don\'t rock')
      } else {
        setFeedback('✅ Pull to chest, squeeze back')
      }
    } else if (armAngle > 150 && repStateRef.current === 'down') {
      repStateRef.current = 'up'
      setReps(prev => prev + 1)
      setFeedback('✅ Rep counted! Good row!')
    }
  }

  const analyzeGenericForm = (armAngle, legAngle) => {
    if (armAngle < 90 || legAngle < 90) {
      setFeedback('✅ Good range of motion!')
    } else if (armAngle > 150 && legAngle > 150) {
      setFeedback('💪 Keep moving, maintain form')
    } else {
      setFeedback('⚡ Control the movement')
    }
  }

  const updateFormScore = (armAngle, legAngle, torsoAngle) => {
    let score = 100
    
    // Deduct points for poor form
    if (Math.abs(armAngle - 90) > 30) score -= 10
    if (Math.abs(legAngle - 90) > 30) score -= 10
    if (torsoAngle < 40) score -= 15 // Poor posture
    
    // Bonus for good form
    if (armAngle >= 80 && armAngle <= 100) score += 5
    if (legAngle >= 80 && legAngle <= 100) score += 5
    
    score = Math.min(100, Math.max(60, score))
    setFormScore(Math.round(score))
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="ai-coach-overlay" onClick={onClose}>
      <div className="ai-coach-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ai-coach-close" onClick={onClose}>×</button>
        
        <div className="ai-coach-header">
          <h2>🤖 AI Form Coach</h2>
          <p>{exerciseName}</p>
        </div>

        <div className="ai-coach-content">
          <div className="video-container">
            <video ref={videoRef} className="video-feed" autoPlay playsInline />
            <canvas ref={canvasRef} className="pose-canvas" />
            {isLoading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Initializing camera...</p>
              </div>
            )}
          </div>

          <div className="stats-panel">
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{reps}/{targetReps}</div>
              <div className="stat-label">Reps</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{formScore}%</div>
              <div className="stat-label">Form Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-value">{formatTime(timer)}</div>
              <div className="stat-label">Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{calories.toFixed(1)}</div>
              <div className="stat-label">Calories</div>
            </div>
          </div>

          <div className="feedback-panel">
            <div className="feedback-text">{feedback}</div>
          </div>
        </div>

        <div className="ai-coach-footer">
          <button className="btn-end" onClick={onClose}>
            {isCompleted ? 'Close' : 'End Session'}
          </button>
        </div>
      </div>
    </div>
  )
}
