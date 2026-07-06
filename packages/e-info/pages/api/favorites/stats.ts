import type { NextApiRequest, NextApiResponse } from 'next'

import { serverGraphQL } from '~/utils/server-graphql'
import {
  isFirebaseAdminEnabled,
  verifyFirebaseToken,
} from '~/utils/verify-firebase'

type RequestBody = {
  idToken: string
  memberId: string
  firebaseId: string
}

type MemberFavoriteSectionStats = {
  sectionId: string
  sectionName: string | null
  sectionSlug: string | null
  count: number
  postIds: string[]
}

type MemberFavoriteStats = {
  total: number
  sections: MemberFavoriteSectionStats[]
}

// Query to verify member owns this firebaseId
const VERIFY_MEMBER_OWNERSHIP = `
  query VerifyMemberOwnership($memberId: ID!) {
    member(where: { id: $memberId }) {
      id
      firebaseId
    }
  }
`

const GET_MEMBER_FAVORITE_STATS = `
  query MemberFavoriteStats($memberId: ID!) {
    memberFavoriteStats(memberId: $memberId) {
      total
      sections {
        sectionId
        sectionName
        sectionSlug
        count
        postIds
      }
    }
  }
`

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { idToken, memberId, firebaseId } = req.body as RequestBody

    if (!memberId || !firebaseId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Verify Firebase token if Firebase Admin is enabled
    if (isFirebaseAdminEnabled()) {
      if (!idToken) {
        return res.status(401).json({ error: 'ID token required' })
      }

      const verifyResult = await verifyFirebaseToken(idToken)

      if (!verifyResult.success && !verifyResult.skipped) {
        return res.status(401).json({ error: verifyResult.error })
      }

      // Ensure the token uid matches the provided firebaseId
      if (verifyResult.success && verifyResult.uid !== firebaseId) {
        return res.status(403).json({
          error: 'Firebase ID mismatch',
        })
      }
    }

    // Verify the memberId belongs to this firebaseId
    const ownershipResult = await serverGraphQL<{
      member: { id: string; firebaseId: string } | null
    }>(VERIFY_MEMBER_OWNERSHIP, { memberId })

    if (ownershipResult.error) {
      console.error(
        '[API /favorites/stats] Ownership check error:',
        ownershipResult.error
      )
      return res.status(500).json({ error: ownershipResult.error })
    }

    const member = ownershipResult.data?.member
    if (!member || member.firebaseId !== firebaseId) {
      return res.status(403).json({
        error: 'Member ID does not belong to this user',
      })
    }

    const statsResult = await serverGraphQL<{
      memberFavoriteStats: MemberFavoriteStats
    }>(GET_MEMBER_FAVORITE_STATS, { memberId })

    if (statsResult.error) {
      console.error('[API /favorites/stats] GraphQL error:', statsResult.error)
      return res.status(500).json({ error: statsResult.error })
    }

    const stats = statsResult.data?.memberFavoriteStats ?? {
      total: 0,
      sections: [],
    }

    return res.status(200).json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('[API /favorites/stats] Error:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    })
  }
}
