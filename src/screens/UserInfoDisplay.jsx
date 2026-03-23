import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const UserInfoDisplay = ({ data }) => {
  if (!data) return null;

  // Helper to parse JSON strings
  const parseIfNeeded = (value) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return parsed;
      } catch (e) {
        return value;
      }
    }
    return value;
  };

  // Format display value - show name if both id and name exist
  const getDisplayValue = (value) => {
    if (value === null || value === undefined) return 'Not provided';
    
    const parsed = parseIfNeeded(value);
    
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return 'None';
      return parsed.map(item => {
        if (typeof item === 'object' && item !== null) {
          if (item.categoryName) return item.categoryName;
          if (item.name) return item.name;
          return JSON.stringify(item);
        }
        return item;
      }).join(', ');
    }
    
    if (typeof parsed === 'object' && parsed !== null) {
      if (parsed.categoryName) return parsed.categoryName;
      if (parsed.name) return parsed.name;
      return JSON.stringify(parsed);
    }
    
    if (typeof parsed === 'boolean') return parsed ? 'Yes' : 'No';
    
    return String(parsed);
  };

  // Fields to show (skip IDs, show names instead)
  const displayFields = {
    'Full Name': data.full_name,
    'User Type': data.user_type,
    'Mobile Number': data.mobile_number,
    'Email': data.email,
    'Gender': data.gender,
    'Date of Birth': data.date_of_birth,
    'District': data.dist_name,
    'Mandal': data.mandal_name,
    'Village': data.village_name,
    'Address': `${data.plot_or_house_number || ''}${data.landmark ? ', ' + data.landmark : ''}`,
    'Pincode': data.pincode,
    'Employer Type': data.employer_type_name,
    'Avg Workers/Month': data.average_workers_hired_per_month,
    'Document Type': data.document_type,
    'Document Number': data.document_number,
    'Labour Licence': data.labour_licence,
    'Categories': data.categories,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {Object.entries(displayFields).map(([label, value]) => {
          if (value === null || value === undefined || value === '[]' || value === '') return null;
          
          const displayValue = getDisplayValue(value);
          
          return (
            <View key={label} style={styles.row}>
              <Text style={styles.label}>{label}:</Text>
              <Text style={styles.value}>{displayValue}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    width: '35%',
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  value: {
    width: '65%',
    fontSize: 14,
    color: '#333',
  },
});

export default UserInfoDisplay;