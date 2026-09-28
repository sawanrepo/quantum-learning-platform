import numpy as np
import math
from typing import List, Tuple, Dict
from app.schemas.schemas import BlochSphereVector

def calculate_bloch_vectors(statevector: np.ndarray, num_qubits: int) -> List[BlochSphereVector]:
    """
    Given an n-qubit statevector (length 2^n complex numbers), compute the Bloch sphere
    vector coordinates (x, y, z, theta, phi) and single-qubit probabilities for each qubit.
    """
    bloch_vectors = []
    
    # Normalize statevector if needed
    norm = np.linalg.norm(statevector)
    if norm > 0:
        sv = statevector / norm
    else:
        sv = statevector

    for q in range(num_qubits):
        # We compute single-qubit reduced density matrix rho_q for qubit q
        # Qiskit / standard ordering: qubit index q (0 is LSB or MSB)
        # Let's use little-endian bit representation where qubit 0 is index 0
        rho = np.zeros((2, 2), dtype=complex)
        
        dim = 2 ** num_qubits
        for i in range(dim):
            # Extract bit value of qubit q in index i
            bit_val_i = (i >> q) & 1
            for j in range(dim):
                bit_val_j = (j >> q) & 1
                # Check if all other qubits match
                mask = ~(1 << q)
                if (i & mask) == (j & mask):
                    rho[bit_val_i, bit_val_j] += sv[i] * np.conj(sv[j])

        # Pauli matrices expectation values
        # x = 2 * Re(rho[0, 1])
        # y = 2 * Im(rho[1, 0])
        # z = rho[0, 0] - rho[1, 1]
        
        x = float(2.0 * np.real(rho[0, 1]))
        y = float(2.0 * np.imag(rho[1, 0]))
        z = float(np.real(rho[0, 0] - rho[1, 1]))
        
        # Clamp to avoid numerical floating point errors outside [-1, 1]
        x = max(-1.0, min(1.0, round(x, 6)))
        y = max(-1.0, min(1.0, round(y, 6)))
        z = max(-1.0, min(1.0, round(z, 6)))

        # Spherical coordinates
        # r = sqrt(x^2 + y^2 + z^2)
        r = math.sqrt(x*x + y*y + z*z)
        theta = math.acos(z) if r > 1e-6 else 0.0 # [0, pi]
        phi = math.atan2(y, x) # [-pi, pi]

        prob_0 = float(np.real(rho[0, 0]))
        prob_1 = float(np.real(rho[1, 1]))
        
        # State string representation
        if z > 0.99:
            state_str = "|0⟩"
        elif z < -0.99:
            state_str = "|1⟩"
        elif abs(z) < 0.1 and abs(y) < 0.1 and x > 0.9:
            state_str = "|+⟩"
        elif abs(z) < 0.1 and abs(y) < 0.1 and x < -0.9:
            state_str = "|-⟩"
        elif abs(z) < 0.1 and abs(x) < 0.1 and y > 0.9:
            state_str = "|i+⟩"
        elif abs(z) < 0.1 and abs(x) < 0.1 and y < -0.9:
            state_str = "|i-⟩"
        else:
            state_str = f"θ={round(theta, 2)} rad, φ={round(phi, 2)} rad"

        bloch_vectors.append(
            BlochSphereVector(
                qubit_index=q,
                x=x,
                y=y,
                z=z,
                theta=theta,
                phi=phi,
                state_str=state_str,
                prob_0=round(max(0.0, min(1.0, prob_0)), 4),
                prob_1=round(max(0.0, min(1.0, prob_1)), 4)
            )
        )

    return bloch_vectors
