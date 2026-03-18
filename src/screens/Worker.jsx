import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from "react-native-safe-area-context";


const Worker = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.name}>Aditya Kumar</Text>
              <Text style={styles.phone}>8920254311</Text>
              <Text style={styles.email}>aditya76@gmail.com</Text>
            </View>
            <View style={styles.profileIcon}>
              <Icon name="person" size={40} color="#666" />
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Not Available Badge */}
          <View style={styles.notAvailable}>
            <Icon name="warning" size={20} color="#ff9800" />
            <Text style={styles.notAvailableText}>Not Available</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.infoRow}>
          <Icon name="location-on" size={20} color="#666" />
          <Text style={styles.infoText}>Gautam Buddha Nagar, Uttar Pradesh</Text>
        </View>

        {/* Work Info */}
        <View style={styles.workInfoContainer}>
          <View style={styles.workInfoItem}>
            <Text style={styles.workInfoLabel}>Work / Job Applied</Text>
            <Text style={styles.workInfoValue}>Chat</Text>
          </View>
          <View style={styles.workInfoItem}>
            <Text style={styles.workInfoLabel}>Experience</Text>
            <Text style={styles.workInfoValue}>5 Years</Text>
          </View>
          <View style={styles.workInfoItem}>
            <Text style={styles.workInfoLabel}>Age</Text>
            <Text style={styles.workInfoValue}>40</Text>
          </View>
        </View>

        {/* Welfare and Schemes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welfare and Schemes</Text>
          <View style={styles.schemesContainer}>
            <View style={styles.schemeItem}>
              <Text style={styles.schemeLabel}>Age:</Text>
              <Text style={styles.schemeValue}>40</Text>
            </View>
            <View style={styles.schemeItem}>
              <Text style={styles.schemeLabel}>Experience:</Text>
              <Text style={styles.schemeValue}>5 Years</Text>
            </View>
          </View>
        </View>

        {/* Work History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work History</Text>
          
          {/* First Work Experience */}
          <View style={styles.workCard}>
            <View style={styles.workHeader}>
              <Text style={styles.projectName}>RCC Building</Text>
              <Text style={styles.projectDate}>20 Dec 2022</Text>
            </View>
            <Text style={styles.constructionType}>
              Construction – Block A, Smart City Project
            </Text>
            
            <View style={styles.employerContainer}>
              <Icon name="business" size={16} color="#666" />
              <Text style={styles.employerName}>L&T Construction Ltd</Text>
            </View>
            
            <Text style={styles.description}>
              Worked as a Site Supervisor responsible for RCC slab work, 
              shuttering supervision, bar bending schedule verification, 
              and quality inspection as per IS standards.
            </Text>
            
            <View style={styles.skillsContainer}>
              <Text style={styles.skillsLabel}>Skills:</Text>
              <View style={styles.skillsList}>
                <Text style={styles.skillTag}>RCC Work</Text>
                <Text style={styles.skillTag}>Bar Bending</Text>
                <Text style={styles.skillTag}>Site Supervision</Text>
                <Text style={styles.skillTag}>AutoCAD</Text>
              </View>
            </View>
            
            <View style={styles.paymentContainer}>
              <Text style={styles.paymentText}>
                Payment: Completed (₹42,000/month)
              </Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>4.7/5</Text>
              </View>
            </View>
          </View>

          {/* Second Work Experience */}
          <View style={styles.workCard}>
            <View style={styles.workHeader}>
              <Text style={styles.projectName}>Road Widening & Drainage Work – NH-58, Haridwar Section</Text>
              <Text style={styles.projectDate}>30 Sep 2023</Text>
            </View>
            <Text style={styles.constructionType}>
              Construction
            </Text>
            
            <View style={styles.employerContainer}>
              <Icon name="business" size={16} color="#666" />
              <Text style={styles.employerName}>Shapoorji Pallonji Infra Pvt. Ltd</Text>
            </View>
            
            <Text style={styles.description}>
              Engaged in road widening, subgrade preparation, concrete drainage 
              system installation, and onsite coordination with NHAI engineers 
              for progress verification.
            </Text>
            
            <View style={styles.skillsContainer}>
              <Text style={styles.skillsLabel}>Skills:</Text>
              <View style={styles.skillsList}>
                <Text style={styles.skillTag}>Road Construction</Text>
                <Text style={styles.skillTag}>Drainage Work</Text>
                <Text style={styles.skillTag}>Leveling & Surveying</Text>
                <Text style={styles.skillTag}>Safety Compliance</Text>
              </View>
            </View>
            
            <View style={styles.paymentContainer}>
              <Text style={styles.paymentText}>
                Payment: Completed (₹38,500/month)
              </Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>4.6/5</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Skills & Specializations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills & Specializations</Text>
          <View style={styles.specializationContainer}>
            <Text style={styles.specializationItem}>Helper Mason</Text>
            <Text style={styles.specializationItem}>Assistant Shuttering Carpenter</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  phone: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  notAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 8,
    borderRadius: 4,
  },
  notAvailableText: {
    color: '#ff9800',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  workInfoContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 1,
    padding: 16,
  },
  workInfoItem: {
    flex: 1,
  },
  workInfoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  workInfoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  schemesContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  schemeItem: {
    flexDirection: 'row',
    marginRight: 24,
  },
  schemeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  schemeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  workCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  workHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  projectDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  constructionType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  employerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  employerName: {
    fontSize: 14,
    color: '#444',
    marginLeft: 4,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  skillsContainer: {
    marginTop: 12,
  },
  skillsLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 6,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    color: '#495057',
    marginRight: 6,
    marginBottom: 6,
  },
  paymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  paymentText: {
    fontSize: 13,
    color: '#28a745',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  specializationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specializationItem: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 14,
    color: '#495057',
    marginRight: 8,
    marginBottom: 8,
  },
});

export default Worker;